// controllers/reportController.js
const ExcelJS = require("exceljs");
const axios = require("axios");
const mongoose = require("mongoose");

const Event = require("../models/Event");
const Feedback = require("../models/Feedback");
const AttendanceLog = require("../models/Attendance_log");

// --------------------------------------------------------
// STYLING CONSTANTS
// --------------------------------------------------------
const STYLES = {
    header: {
        font: { size: 16, bold: true, color: { argb: "FFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "1F4E78" } },
        alignment: { horizontal: "center", vertical: "center" },
    },
    subHeader: {
        font: { size: 14, bold: true, color: { argb: "FFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "4472C4" } },
        alignment: { horizontal: "left", vertical: "center" },
    },
    tableHeader: {
        font: { bold: true, color: { argb: "FFFFFF" }, size: 11 },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "70AD47" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
            top: { style: "thin", color: { argb: "000000" } },
            left: { style: "thin", color: { argb: "000000" } },
            bottom: { style: "thin", color: { argb: "000000" } },
            right: { style: "thin", color: { argb: "000000" } },
        },
    },
    tableData: {
        font: { size: 10 },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
            top: { style: "thin", color: { argb: "D3D3D3" } },
            left: { style: "thin", color: { argb: "D3D3D3" } },
            bottom: { style: "thin", color: { argb: "D3D3D3" } },
            right: { style: "thin", color: { argb: "D3D3D3" } },
        },
    },
    chartTitle: {
        font: { size: 12, bold: true, color: { argb: "1F4E78" } },
        alignment: { horizontal: "left", vertical: "center" },
    },
};

// --------------------------------------------------------
// QUICKCHART API — Generate PNG Buffer
// --------------------------------------------------------
async function generateChart(chartConfig) {
    const url = "https://quickchart.io/chart";

    try {
        const response = await axios.post(
            url,
            {
                chart: chartConfig,
                backgroundColor: "white",
                width: 800,
                height: 600,
            },
            {
                responseType: "arraybuffer",
            }
        );

        const buffer = Buffer.from(response.data);

        if (!buffer || buffer.length < 100) {
            console.error("QuickChart returned invalid data. Buffer length:", buffer.length);
            return Buffer.alloc(0);
        }

        console.log("✓ Chart generated. Size:", buffer.length, "bytes");
        return buffer;
    } catch (error) {
        console.error("QuickChart Error:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
        }
        return Buffer.alloc(0);
    }
}

// --------------------------------------------------------
// TRENDLINE — Check-ins every 15 minutes
// --------------------------------------------------------
function computeTrendline(logs) {
    if (!logs.length) return { labels: ["No Data"], data: [0] };

    const sorted = logs.sort(
        (a, b) => new Date(a.time_in) - new Date(b.time_in)
    );

    const start = new Date(sorted[0].time_in);
    const end = new Date(sorted[sorted.length - 1].time_in);

    const labels = [];
    const data = [];
    let interval = new Date(start);

    while (interval <= end) {
        labels.push(
            interval.toLocaleTimeString("en-PH", {
                hour: "2-digit",
                minute: "2-digit",
            })
        );

        const next = new Date(interval.getTime() + 15 * 60000);
        const count = sorted.filter(
            (log) =>
                new Date(log.time_in) >= interval &&
                new Date(log.time_in) < next
        ).length;

        data.push(count);
        interval = next;
    }

    return { labels, data };
}

// --------------------------------------------------------
// HELPER: Add section with title and spacing
// --------------------------------------------------------
function addSection(sheet, currentRow, title) {
    sheet.mergeCells(`A${currentRow}`, `H${currentRow}`);
    const cell = sheet.getCell(`A${currentRow}`);
    cell.value = title;
    Object.assign(cell, STYLES.subHeader);
    sheet.getRow(currentRow).height = 25;
    return currentRow + 1;
}

// --------------------------------------------------------
// HELPER: Add table rows
// --------------------------------------------------------
function addTableRow(sheet, row, colA, colB, isHeader = false) {
    const style = isHeader ? STYLES.tableHeader : STYLES.tableData;
    sheet.getCell(`A${row}`).value = colA;
    sheet.getCell(`B${row}`).value = colB;
    sheet.getCell(`A${row}`).alignment = { horizontal: "left", vertical: "center" };
    sheet.getCell(`B${row}`).alignment = { horizontal: "center", vertical: "center" };
    Object.assign(sheet.getCell(`A${row}`), style);
    Object.assign(sheet.getCell(`B${row}`), style);
    sheet.getRow(row).height = isHeader ? 20 : 18;
}

// --------------------------------------------------------
// MAIN: DOWNLOAD EXCEL REPORT
// --------------------------------------------------------
exports.downloadEventReport = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if (!event)
            return res.status(404).json({ message: "Event not found" });

        const feedbacks = await Feedback.find({ event_id: eventId });

        const attendanceLogs = await AttendanceLog.aggregate([
            { $match: { event_id: new mongoose.Types.ObjectId(eventId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $lookup: {
                    from: "students",
                    localField: "user_id",
                    foreignField: "users_id",
                    as: "student",
                },
            },
            { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "departments",
                    localField: "student.department_id",
                    foreignField: "_id",
                    as: "department",
                },
            },
            {
                $unwind: {
                    path: "$department",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]);

        const attendanceByProgram = {};
        for (const log of attendanceLogs) {
            const program = log.department?.department_code || "Unknown Program";
            attendanceByProgram[program] =
                (attendanceByProgram[program] || 0) + 1;
        }

        // ---------------------------
        // 1. FEEDBACK DATA PREP
        // ---------------------------
        const avgRatings = {
            overall_experience: 0,
            venue_facilities: 0,
            speakers_program: 0,
            event_organization: 0,
        };

        feedbacks.forEach((f) => {
            avgRatings.overall_experience +=
                Number(f.ratings?.overall_experience) || 0;
            avgRatings.venue_facilities +=
                Number(f.ratings?.venue_facilities) || 0;
            avgRatings.speakers_program +=
                Number(f.ratings?.speakers_program) || 0;
            avgRatings.event_organization +=
                Number(f.ratings?.event_organization) || 0;
        });

        const count = feedbacks.length || 1;

        const feedbackLabels = [
            "Overall Experience",
            "Venue Facilities",
            "Speakers & Program",
            "Event Organization",
        ];

        const rawData = [
            avgRatings.overall_experience / count,
            avgRatings.venue_facilities / count,
            avgRatings.speakers_program / count,
            avgRatings.event_organization / count,
        ];

        const feedbackData = rawData.map((val) =>
            isFinite(val) && val >= 0 ? val : 0
        );

        const feedbackChartConfig = {
            type: "pie",
            data: { labels: feedbackLabels, datasets: [{ data: feedbackData }] },
        };
        const feedbackChartBuffer = await generateChart(feedbackChartConfig);

        // ---------------------------
        // 2. ATTENDANCE BY PROGRAM DATA PREP
        // ---------------------------
        const programLabels = Object.keys(attendanceByProgram);
        const programValues = Object.values(attendanceByProgram).map(Number);
        const hasAttendanceData = programLabels.length > 0;

        const attendanceChartConfig = {
            type: "pie",
            data: {
                labels: hasAttendanceData
                    ? programLabels
                    : ["No Attendance Data"],
                datasets: [
                    {
                        data: hasAttendanceData ? programValues : [1],
                    },
                ],
            },
        };
        const attendanceChartBuffer = await generateChart(attendanceChartConfig);

        // ---------------------------
        // 3. TRENDLINE BAR CHART DATA PREP
        // ---------------------------
        const trend = computeTrendline(attendanceLogs);

        const trendlineChartConfig = {
            type: "bar",
            data: {
                labels: trend.labels,
                datasets: [
                    { label: "Check-ins per 15 minutes", data: trend.data },
                ],
            },
        };
        const trendlineChartBuffer = await generateChart(trendlineChartConfig);

        // ---------------------------
        // CREATE EXCEL WORKBOOK
        // ---------------------------
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Event Report");

        sheet.getColumn(1).width = 28;
        sheet.getColumn(2).width = 18;
        sheet.getColumn(3).width = 3;
        sheet.getColumn(4).width = 18;
        sheet.getColumn(5).width = 18;
        sheet.getColumn(6).width = 18;
        sheet.getColumn(7).width = 18;
        sheet.getColumn(8).width = 18;

        let currentRow = 1;

        // ========== REPORT HEADER ==========
        sheet.mergeCells(`A${currentRow}`, `H${currentRow}`);
        const headerCell = sheet.getCell(`A${currentRow}`);
        headerCell.value = `📊 ${event.event_name} – Event Report`;
        Object.assign(headerCell, STYLES.header);
        sheet.getRow(currentRow).height = 30;
        currentRow++;

        sheet.mergeCells(`A${currentRow}`, `H${currentRow}`);
        const dateCell = sheet.getCell(`A${currentRow}`);
        dateCell.value = `📅 Event Date: ${new Date(
            event.event_date
        ).toDateString()}`;
        dateCell.font = { size: 11, italic: true, color: { argb: "666666" } };
        currentRow++;
        currentRow++;

        // ========== SECTION 1: FEEDBACK SUMMARY ==========
        currentRow = addSection(sheet, currentRow, "📝 1. Feedback Summary");
        currentRow++;

        addTableRow(
            sheet,
            currentRow,
            "Feedback Category",
            "Average Rating (/ 5)",
            true
        );
        currentRow++;

        feedbackLabels.forEach((label, index) => {
            addTableRow(
                sheet,
                currentRow,
                label,
                feedbackData[index].toFixed(2),
                false
            );
            currentRow++;
        });

        currentRow += 2;

        // Add feedback chart
        const feedbackChartRow = currentRow;
        const feedbackTitle = sheet.getCell(`D${currentRow}`);
        feedbackTitle.value = "Distribution Chart";
        Object.assign(feedbackTitle, STYLES.chartTitle);
        currentRow++;

        if (feedbackChartBuffer.length > 0) {
            const fImage = workbook.addImage({
                buffer: feedbackChartBuffer,
                extension: "png",
            });
            sheet.addImage(fImage, {
                tl: { col: 3, row: feedbackChartRow },
                ext: { width: 520, height: 390 },
            });
        } else {
            sheet.getCell(`D${currentRow}`).value = "Chart failed to generate.";
        }

        currentRow += 20;

        // ========== SECTION 2: ATTENDANCE BY PROGRAM ==========
        currentRow = addSection(sheet, currentRow, "👥 2. Attendance by Program");
        currentRow++;

        addTableRow(
            sheet,
            currentRow,
            "Program / Department",
            "Attendance Count",
            true
        );
        currentRow++;

        programLabels.forEach((label, index) => {
            addTableRow(
                sheet,
                currentRow,
                label,
                programValues[index].toString(),
                false
            );
            currentRow++;
        });

        currentRow += 2;

        // Add attendance chart
        const attendanceChartRow = currentRow;
        const attendanceTitle = sheet.getCell(`D${currentRow}`);
        attendanceTitle.value = "Distribution Chart";
        Object.assign(attendanceTitle, STYLES.chartTitle);
        currentRow++;

        if (attendanceChartBuffer.length > 0) {
            const aImage = workbook.addImage({
                buffer: attendanceChartBuffer,
                extension: "png",
            });
            sheet.addImage(aImage, {
                tl: { col: 3, row: attendanceChartRow },
                ext: { width: 520, height: 390 },
            });
        } else {
            sheet.getCell(`D${currentRow}`).value = "Chart failed to generate.";
        }

        currentRow += 20;

        // ========== SECTION 3: ATTENDANCE TREND ==========
        currentRow = addSection(
            sheet,
            currentRow,
            "📈 3. Attendance Trend (Check-ins every 15 minutes)"
        );
        currentRow++;

        addTableRow(
            sheet,
            currentRow,
            "Time Interval",
            "Check-ins",
            true
        );
        currentRow++;

        trend.labels.slice(0, 20).forEach((label, index) => {
            addTableRow(
                sheet,
                currentRow,
                label,
                trend.data[index].toString(),
                false
            );
            currentRow++;
        });

        if (trend.labels.length > 20) {
            sheet.getCell(`A${currentRow}`).value = `... and ${
                trend.labels.length - 20
            } more intervals.`;
            sheet.getCell(`A${currentRow}`).font = {
                italic: true,
                color: { argb: "999999" },
            };
            currentRow++;
        }

        currentRow += 2;

        // Add trendline chart
        const trendlineChartRow = currentRow;
        const trendlineTitle = sheet.getCell(`D${currentRow}`);
        trendlineTitle.value = "Trend Chart";
        Object.assign(trendlineTitle, STYLES.chartTitle);
        currentRow++;

        if (trendlineChartBuffer.length > 0) {
            const tImage = workbook.addImage({
                buffer: trendlineChartBuffer,
                extension: "png",
            });
            sheet.addImage(tImage, {
                tl: { col: 3, row: trendlineChartRow },
                ext: { width: 520, height: 390 },
            });
        } else {
            sheet.getCell(`D${currentRow}`).value = "Chart failed to generate.";
        }

        // ---------------------------
        // SEND EXCEL FILE
        // ---------------------------
        const buffer = await workbook.xlsx.writeBuffer();

        const fileName = `${event.event_name.replace(
            /[^a-z0-9]/gi,
            "_"
        )}_Report_${eventId}.xlsx`;

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );
        res.setHeader("Content-Length", buffer.length);

        res.send(buffer);
    } catch (error) {
        console.error("Report generation failed:", error);
        res.status(500).json({
            message: "Failed to generate report",
            error: error.message || "Unknown error",
        });
    }
};