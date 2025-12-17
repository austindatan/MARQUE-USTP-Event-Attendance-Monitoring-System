# MARQUE – USTP Event Attendance Monitoring System

**A USTP-CDO Event Attendance Monitoring System**

## Mobile Application

MARQUE is a mobile-based **Event Attendance Monitoring System** developed for the **University of Science and Technology of Southern Philippines (USTP)**. The system streamlines event attendance tracking using QR codes, role-based access control, and real-time data processing to improve accuracy, efficiency, and transparency in university-wide events.

This repository/documentation focuses on the **MARQUE Mobile Application**, which supports administrators, organization officers, committees, and students in managing and participating in events.

---

## Table of Contents

* Introduction
* Overview
* Purpose
* Features
* User Roles
* Installation & Setup
* Test Credentials
* System Requirements
* Access Control
* Navigation
* Role-Based Usage
* Troubleshooting & Support
* Limitations
* Acknowledgements

---

## Introduction

The MARQUE Mobile Application is a core component of the MARQUE system, designed to provide reliable, real-time to near real-time updates on event attendance, participant verification, and system activity. It enables authorized users to manage events, record attendance, and generate reports using mobile devices connected to the internet.

The application reduces manual attendance processes while ensuring secure and role-based access to event data, in compliance with institutional data privacy principles.

---

## Overview

MARQUE allows USTP stakeholders to:

* Create and manage events
* Track attendance using QR code scanning
* Verify participation through photo proof
* Generate attendance reports
* Collect post-event feedback

All features are accessible based on assigned user roles, ensuring controlled and secure system usage.

---

## Purpose

This README and accompanying documentation serve as a guide for developers, testers, and evaluators to understand the scope, functionality, and setup of the MARQUE Mobile Application. It outlines system features, role-based access, installation steps, and operational guidelines.

---

## Key Features

1. QR Code Scanner for Attendance Logging
The system utilizes a QR code scanner to accurately record event attendance. This feature allows committees to scan participant QR codes in real time, ensuring fast, secure, and error-free attendance logging.

2. Downloadable Event Analytics and Reports
MARQUE provides downloadable event analytics files that summarize attendance data, participant statistics, and event performance. These reports can be used for documentation, evaluation, and decision-making purposes.

3. Feedback Collection Module
The system includes a feedback feature that allows participants to submit comments and evaluations after attending an event. This helps organizations assess event effectiveness and improve future activities.

4. CRUD (Create, Read, Update, Delete) Operations
Authorized users can perform CRUD operations for managing events, users, organizations, and attendance records. This ensures flexible and efficient data management within the system.

5. Notification System
MARQUE features a notification module that informs users about upcoming events, attendance status, important updates, and system announcements in real time.

---

## User Roles

MARQUE supports **five (5) user roles**:

| Role          | Description                                                    |
| ------------- | -------------------------------------------------------------- |
| **Admin**     | Manages users, roles, and organizations                        |
| **President** | Oversees events for one assigned organization                  |
| **Manager**   | Assists event management; may belong to multiple organizations |
| **Committee** | Handles on-site attendance and verification                    |
| **Student**   | Participates in events and submits feedback                    |

---

## Installation & Setup

### APK Installation (Android)

1. Locate the **MARQUE APK** from the Jira Deployment Box.
2. Enable installation from unknown sources:

   * Settings → Security → Install unknown apps
3. Install the APK on your Android device.
4. Launch the app using **Expo Go** to enable full functionality.

**Note:**

* The APK deployment is available for **19 days only**.
* Expo Go is used due to the free trial deployment setup.

---

## Test Credentials

| Role      | Name    | Username   | Password     |
| --------- | ------- | ---------- | ------------ |
| Admin     | Admin   | Admin      | 12345        |
| President | Angelo  | 2023300660 | helloword17A |
| Manager   | Zyrile  | 2023300181 | 12345678     |
| Committee | Rabi    | 2023300123 | rabibaho     |
| Student   | Sabrina | 2023300120 | 12345        |

> For testing purposes only. Do not share credentials publicly.

---

## System Requirements

### Software

* **Android:** Minimum Android 9.0 (Oreo and above)
* **iOS:** Not yet supported
* **Windows App:** Not supported

### Hardware

* Minimum **4 GB RAM**
* Stable internet connection required

### Additional Requirements

* Google services updated
* App permissions enabled (camera, storage)
* Internet connection required for all core features

---

## Access Control

* Access is strictly role-based
* Role assignment and modification are handled by Admin users
* Unauthorized access is restricted
* Accounts may be revoked upon role removal or policy violations

---

## Navigation

* Users are redirected to the **Events Tab** after login
* Navigation includes:

  * Events
  * Attendance
  * Notifications
  * Profile
* Logout is accessible via the **Profile Tab**

---

## Role-Based Usage

Each role has a dedicated workflow:

* **Admin:** User & organization management
* **President:** Event creation, reports, analytics
* **Manager:** Event support and attendance monitoring
* **Committee:** QR scanning and photo proof verification
* **Student:** Event participation and feedback submission

---

## Troubleshooting & Support

Common issues include:

* App crashes or failure to launch
* Internet connectivity problems
* Login or account issues
* Missing data or permissions

Recommended actions:

* Restart device
* Clear app cache
* Reinstall app
* Verify permissions and internet connection

---

## Limitations

* Internet-dependent functionality
* Analytics available primarily via downloadable reports
* iOS support pending
* APK availability limited to deployment period

---

## Acknowledgements

This project was developed as part of a **Software Engineering academic requirement** at USTP. We extend our sincere gratitude to:

* **Sir Cyfred Odarve**, Software Engineering Instructor
* **Sir John Harvey C. Babia**, Elective 1 Instructor (Database Management)
* The **USTP IT Department**
* Participating USTP student organizations
* The **Retuertas family** for their support
* All project members, testers, and contributors

MARQUE represents teamwork, technical learning, and a shared commitment to improving event attendance management at USTP.
