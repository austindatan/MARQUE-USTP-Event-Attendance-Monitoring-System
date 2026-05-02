# MARQUE System — Setup Guide

## Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (for mobile)
- MongoDB Atlas account (or local MongoDB)

---

## Quick Install (Windows)

Run this from the project root in PowerShell:

```powershell
.\install.ps1
```

---

## Manual Install

### Backend
```bash
cd backend
npm install
```

**Required packages:**
| Package | Version | Purpose |
|---|---|---|
| express | ^5.1.0 | Web framework |
| mongoose | ^8.19.3 | MongoDB ODM |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| cors | ^2.8.5 | Cross-origin requests |
| dotenv | ^17.2.3 | Environment variables |
| axios | ^1.13.2 | HTTP client |
| cloudinary | ^1.41.3 | Image storage |
| multer | ^2.0.2 | File uploads |
| multer-storage-cloudinary | ^4.0.0 | Cloudinary + Multer |
| exceljs | ^4.4.0 | Excel report generation |
| pdfkit | ^0.17.2 | PDF generation |
| node-cron | ^4.2.1 | Scheduled tasks |
| nodemon | ^3.1.10 | Dev auto-reload |

### Mobile
```bash
cd mobile
npm install
```

**Key packages:**
| Package | Version | Purpose |
|---|---|---|
| expo | ~54.0.22 | Mobile framework |
| expo-router | ^6.0.15 | File-based routing |
| react-native | 0.81.5 | Mobile UI framework |
| axios | ^1.13.2 | API calls |
| @react-native-async-storage/async-storage | 2.2.0 | Token storage |
| expo-camera | ~17.0.9 | QR/barcode scanning |
| expo-image-picker | ~17.0.9 | Profile photo upload |
| jwt-decode | ^4.0.0 | Decode JWT tokens |

---

## Environment Setup

### Backend `.env`
Copy the example and fill in your values:
```bash
cp backend/.env.example backend/.env
```

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/marque_db
JWT_SECRET=<your_strong_random_secret>
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

### Mobile `config.js`
Copy the example and set your local IP:
```bash
cp mobile/config.example.js mobile/config.js
```

```js
export const BASE_URL = "http://<your_local_ip>:5000";
```

> ⚠️ Use your machine's local network IP (e.g. `192.168.1.x`), not `localhost`, for mobile to reach the backend.

---

## Running the System

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Mobile
cd mobile
npx expo start
```

---

## Known Missing Packages (run `npm install` to fix)
- `backend`: `exceljs`, `node-cron` — not currently installed in node_modules
- `mobile`: entire `node_modules` not installed — run `npm install`
