# MARQUE – USTP Event Attendance Monitoring System

## Project Overview

**MARQUE** is a mobile-based **Event Attendance Monitoring System** developed for the **University of Science and Technology of Southern Philippines (USTP)**. The mobile application is designed to provide reliable, real-time to near real-time attendance tracking for university events, improving efficiency, accuracy, and data management.

MARQUE enables administrators, organization officers, and committees to manage events and monitor attendance, while allowing students to easily view events, receive notifications, and confirm participation through secure and streamlined processes.

---

## Key Features

* Secure login with role-based authentication
* Mobile-friendly navigation and interface
* Event creation, editing, and cancellation
* QR Code–based attendance scanning
* Photo proof upload and verification
* Real-time attendance logs
* Notifications for events and updates
* Attendance reports and downloadable records
* Feedback collection for attended events only

---

## User Roles and Permissions

### Student

* View upcoming and ongoing events
* View event details
* Receive event notifications
* View attendance summary in profile
* Click events from attendance summary to view details
* Submit feedback **only if attended the event**
* Upload photo proof when required
* Set or update email address (optional)

> Students cannot join organizations or access organization-side features.

---

### Administrator

* Create, edit, and delete user accounts
* Assign and manage user roles (Admin, President, Manager, Committee, Student)
* View all users, including users with multiple roles
* Add, edit, and delete organizations
* View organization lists
* Manage system authentication and access control

---

### President

* Manage **one assigned organization**
* Add, edit, and cancel events
* Invite Managers and Committee members within the organization
* Fix QR scanner time window
* Filter students by department or organization
* View and download attendance reports
* View feedback summaries and attendance analytics

---

### Manager

* Manage events for assigned organization(s)
* Add, edit, and cancel events
* Invite Committee members
* Fix QR scanner time window
* View and download attendance reports
* Monitor attendance logs

---

### Committee

* Scan QR codes to record attendance
* Verify uploaded photo proof
* View assigned event details

> Committee members cannot add, edit, or delete events, and cannot assign roles.

---

## System Modules (Based on Jira Sprints)

* Authentication and Role Management
* User and Organization Management
* Event Management
* Attendance Logging
* QR Code Scanner
* Photo Proof Upload
* Feedback System
* Notifications
* Search and Filter
* Reports and Attendance Summary

---

## Tech Stack

### Mobile Application

* **Framework:** React Native (Expo)
* **Navigation:** Expo Router, React Navigation
* **Language:** TypeScript / JavaScript
* **UI & Styling:** Expo Vector Icons, Lucide Icons, React Native Size Matters
* **State & Storage:** Async Storage
* **API Communication:** Axios
* **Authentication:** JWT-based authentication
* **QR & Media:** Expo Camera, Expo Image Picker, Expo Image Manipulator
* **Location Support:** Expo Location (if enabled)

### Development Tools

* **Package Manager:** npm
* **Linting:** ESLint (Expo config)
* **Platform Support:** Android, iOS, Web (Expo)

---

## Installation and Setup

### Prerequisites

* Node.js (LTS version recommended)
* npm or yarn
* Expo CLI
* Android Studio (for Android emulator) or Xcode (for iOS simulator)

### Installation Steps

1. Clone the repository:

```bash
git clone <repository-url>
cd mobile
```

2. Install dependencies:

```bash
npm install
```

3. Start the Expo development server:

```bash
npm start
```

4. Run the application:

* Scan the QR code using **Expo Go** (Android / iOS), or
* Press `a` to run on Android emulator
* Press `i` to run on iOS simulator
* Press `w` to run on web

---

## Limitations and Known Issues

The following limitations are acknowledged based on the current implementation:

* Analytics reports are available in **downloadable format only** (no in-app charts)
* Attendance spreadsheet export may experience issues under certain conditions
* Multi-day event date display may have formatting limitations
* Feedback comments viewing is limited in the current UI
* Some organization-specific filters depend on correct role and organization assignment
* Offline attendance recording is not supported

These limitations are subject to future improvements.

---

## System Behavior Notes

* Event status automatically updates once an event is concluded
* Notifications are shown only for relevant events
* Feedback submission is disabled if the user did not attend the event
* Organization-specific filtering is enforced across roles
* Join Organization feature is removed

---

## Security and Privacy

MARQUE follows data privacy principles by collecting only the minimum amount of personal information necessary for attendance monitoring. All data is handled securely and used strictly for official academic and institutional purposes in accordance with USTP policies and applicable data protection laws.

---

## Project Information

* **Project Name:** MARQUE – USTP Event Attendance Monitoring System
* **Platform:** Mobile Application
* **Institution:** University of Science and Technology of Southern Philippines
* **Project Type:** Software Engineering Project

---

## License

This project is intended for **academic and institutional use only** under USTP guidelines.

---

 *MARQUE streamlines event attendance management—making USTP events smarter, faster, and more reliable.*
