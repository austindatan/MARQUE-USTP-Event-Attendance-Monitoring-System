const axios = require('axios');
const Event = require('../models/Event');
const Organization = require('../models/Organization');
const Department = require('../models/Department');
const Student = require('../models/Student');
const AttendanceLog = require('../models/Attendance_log');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5002';

const ORG_TYPE_MAP = {
    'Unit Organization': 0,
    'Mother Organization': 1,
    'FAESO Organization': 2,
};

/**
 * Determine the scoped audience size for a given org + department.
 *
 * Rules (priority order):
 *  1. Dept name === "University Student Government"  OR  FAESO org  → all students
 *  2. Dept name contains "student council" (case-insensitive) → same-college students
 *  3. Unit Organization → same-department students
 *  4. Fallback → same-college students (or all if no college)
 */
const getScopeAndAudienceSize = async (org, dept) => {
    const deptName = (dept?.department_name || '').toLowerCase();
    const orgType  = org.org_type || '';
    const deptId   = org.department_id;
    const collegeId = dept?.college_id;

    const isUSG   = deptName === 'university student government';
    const isFAESO = orgType === 'FAESO Organization';

    if (isUSG || isFAESO) {
        const count = await Student.countDocuments({});
        return { audience_size: count, scope: 'All Students (University-wide)' };
    }

    if (deptName.includes('student council') && collegeId) {
        const count = await Student.countDocuments({ college_id: collegeId });
        return { audience_size: count, scope: 'College Students' };
    }

    if (orgType === 'Unit Organization' && deptId) {
        const count = await Student.countDocuments({ department_id: deptId });
        return { audience_size: count, scope: 'Department Students' };
    }

    // Fallback: college-level
    if (collegeId) {
        const count = await Student.countDocuments({ college_id: collegeId });
        return { audience_size: count, scope: 'College Students' };
    }

    const count = await Student.countDocuments({});
    return { audience_size: count, scope: 'All Students' };
};

/**
 * Compute historical attendance stats for an org.
 * Returns average 'Present' count and total past event count.
 */
const getOrgHistory = async (orgId) => {
    const pastEvents = await Event.find(
        { organization_id: orgId, status: 'Concluded' },
        '_id'
    ).lean();

    if (pastEvents.length === 0) {
        return { org_avg_present_count: 0, org_event_count: 0 };
    }

    let total = 0;
    for (const ev of pastEvents) {
        const n = await AttendanceLog.countDocuments({ event_id: ev._id, status: 'Present' });
        total += n;
    }

    return {
        org_avg_present_count: parseFloat((total / pastEvents.length).toFixed(2)),
        org_event_count: pastEvents.length,
    };
};

/**
 * Core reusable forecast computation for an event ID.
 * Returns the full forecast payload object (same shape as the HTTP response body),
 * or throws on error.
 */
const computeForecast = async (eventId) => {
    // 1. Fetch the event and deeply populate org → department → college
    const event = await Event.findById(eventId).populate({
        path: 'organization_id',
        populate: { path: 'department_id' },
    });

    if (!event) throw new Error(`Event not found: ${eventId}`);

    const org  = event.organization_id;
    const dept = org?.department_id;

    if (!org) throw new Error(`Event ${eventId} has no associated organization`);

    // 2. Determine scope + audience size
    const { audience_size, scope } = await getScopeAndAudienceSize(org, dept);

    // 3. Org historical stats
    const { org_avg_present_count, org_event_count } = await getOrgHistory(org._id);

    // 4. Derived time features
    const eventDate     = new Date(event.event_date);
    const startTime     = new Date(event.start_time);
    const endTime       = new Date(event.end_time);
    const durationHours = parseFloat(
        ((endTime - startTime) / (1000 * 60 * 60)).toFixed(2)
    );

    const features = {
        is_mandatory:          event.is_mandatory ? 1 : 0,
        day_of_week:           eventDate.getDay(),
        month:                 eventDate.getMonth() + 1,
        duration_hours:        durationHours,
        org_type_encoded:      ORG_TYPE_MAP[org.org_type] ?? 1,
        audience_size,
        org_avg_present_count,
        org_event_count,
    };

    // 5. Call Python ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, features, {
        timeout: 10_000,
    });

    const ml = mlResponse.data;

    return {
        success:                true,
        event_id:               eventId,
        event_name:             event.event_name,
        scope,
        audience_size,
        predicted_count:        ml.predicted_count,
        predicted_rate_percent: ml.predicted_rate_percent,
        confidence:             ml.confidence,
        org_event_count,
    };
};

/**
 * Compute forecast for an event and broadcast the result to all connected
 * WebSocket clients as a FORECAST_UPDATED message.
 * Silently swallows errors so callers never fail because of this side-effect.
 */
const getForecastAndBroadcast = async (eventId) => {
    try {
        const { broadcast } = require('../websocket');
        const payload = await computeForecast(eventId);
        broadcast({ type: 'FORECAST_UPDATED', forecast: payload });
        console.log(`[ML] Forecast broadcast for event ${eventId}`);
    } catch (err) {
        console.error(`[ML] getForecastAndBroadcast failed for ${eventId}:`, err.message);
    }
};

// ─── GET /api/ml/forecast/:eventId ───────────────────────────────────────────
const getForecast = async (req, res) => {
    try {
        const { eventId } = req.params;
        const payload = await computeForecast(eventId);
        return res.json(payload);

    } catch (err) {
        // ML service is down
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
            return res.status(503).json({
                success: false,
                message: 'ML service is currently unavailable.',
                predicted_count: null,
            });
        }
        // Model not yet trained
        if (err.response?.status === 503) {
            return res.status(503).json({
                success: false,
                message: err.response.data?.message || 'Model not trained yet.',
                predicted_count: null,
            });
        }
        if (err.message?.startsWith('Event not found')) {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error('[mlController] getForecast error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error during forecast.' });
    }
};

// ─── POST /api/ml/train ───────────────────────────────────────────────────────
const triggerTrain = async (req, res) => {
    try {
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/train`, {}, { timeout: 120_000 });

        // After successful retrain, broadcast fresh forecasts for all active events
        setImmediate(async () => {
            try {
                const activeEvents = await Event.find({
                    status: { $in: ['Upcoming', 'Ongoing'] },
                }).select('_id').lean();

                console.log(`[ML] Rebroadcasting forecasts for ${activeEvents.length} active event(s) after retrain`);
                for (const ev of activeEvents) {
                    await getForecastAndBroadcast(ev._id.toString());
                }
            } catch (broadcastErr) {
                console.error('[ML] Post-retrain broadcast error:', broadcastErr.message);
            }
        });

        return res.json(mlResponse.data);
    } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
            return res.status(503).json({ success: false, message: 'ML service is currently unavailable.' });
        }
        if (err.response) {
            return res.status(err.response.status).json(err.response.data);
        }
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getForecast, triggerTrain, computeForecast, getForecastAndBroadcast };


