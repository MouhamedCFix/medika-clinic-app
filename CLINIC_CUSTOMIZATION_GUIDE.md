# MEDIKA BEAUTY CLINIC — Complete Operational & Customization Guide

This guide covers all features of your clinic application, including security login for VPN access, appointment conflict prevention, database recovery, logo uploading, and theme colors.

---

## 📑 Table of Contents
1. [Security Login (Boss & Staff Roles for VPN Access)](#1-security-login-boss--staff-roles-for-vpn-access)
2. [Multi-Computer & VPN Access (Boss PC & Reception)](#2-multi-computer--vpn-access-boss-pc--reception)
3. [Appointment Management & Double-Booking Prevention](#3-appointment-management--double-booking-prevention)
4. [Well-Formatted Excel Export (Matching Your Clinic Card)](#4-well-formatted-excel-export)
5. [Database Backup & How to Recover / Restore It](#5-database-backup--how-to-recover--restore-it)
6. [Changing Clinic Logo & Theme Colors](#6-changing-clinic-logo--theme-colors)
7. [Modifying Doctors, Specialists & Machine Roster](#7-modifying-doctors-specialists--machine-roster)
8. [Modifying Client Data & Skin Types](#8-modifying-client-data--skin-types)

---

## 1. Security Login (Boss & Staff Roles for VPN Access)

To protect patient confidentiality when accessed across the clinic Wi-Fi or via **VPN**, the application includes a secure authentication system:

### Default Login Accounts:
| Role | Username | Default Password | Permissions |
|---|---|---|---|
| **👑 Boss (Admin)** | `boss` | `boss123` | Full access to Appointments, Queues, Client Spreadsheets, Clinic Settings, Staff Rosters, and Database Backup & Restore. |
| **👩‍⚕️ Staff Reception** | `reception` | `staff123` | Access to Appointments, Waiting Room Check-In, and Client Spreadsheets. |

### Changing Your Password:
1. Click the **Settings icon (⚙️)** in the top navigation bar.
2. Under **"Account Security & Password"**, click **"Change Password"**.
3. Enter your current password and your new password, then click **"Save New Password"**.

---

## 2. Multi-Computer & VPN Access (Boss PC & Reception)

The application runs locally and accepts incoming connections from any authorized device on your network or VPN:

1. Main Computer Address:
   ```
   http://192.168.0.56:3000
   ```
2. **On the Boss Computer** (via clinic Wi-Fi or VPN):
   - Open **Google Chrome**.
   - Navigate to `http://192.168.0.56:3000`.
   - Log in using your Boss credentials (`boss` / `boss123`).
3. You will have full real-time visibility into today's appointments, waiting clients, and session logs.

---

## 3. Appointment Management & Double-Booking Prevention

### Editing Appointments:
* In the **Appointments** tab, click the **"Edit"** button (pencil icon) next to any booked client:
  - Modify the **Date**, **Time**, **Specialist**, **Package**, or **Status** (`Scheduled`, `Checked In`, `Completed`, `Cancelled`).

### Double-Booking Conflict Prevention:
* **The Rule**: A specialist (e.g. `ELVANA`, `NANCY`, `ZEINA`, `NTHALEI`) **cannot be booked in two appointments at the same time**.
* If a receptionist or the Boss tries to schedule or edit an appointment that overlaps with an existing appointment for that staff member, the system **blocks the booking** and shows a clear conflict alert:
  > *"Schedule Conflict: Specialist 'NTHALEI' already has an appointment at 11:30 AM on 2026-10-04 with client 'KALTHOUM ABO MJER'. Please pick another time or specialist."*

---

## 4. Well-Formatted Excel Export

When you open a client's profile (e.g. `KALTHOUM ABO MJER`) and click **"Export to Excel (.xlsx)"**, the generated workbook matches your physical clinic card layout:

* **Header Section**:
  - `MEDIKA BEAUTY CLINIC` (Bold, merged across header)
  - `NO : 78992784`
  - `NAME : KALTHOUM ABO MJER    78/992784`
* **Two Formatted Tables**:
  - **Left Table**: `DATE`, `MACHINE`, `PACKAGE`, `S#`, `SKIN TYPE`, `ENERGY`, `START COUNT`, `END COUNT`, `EMPLOYEE`, `M/C`.
  - **Right Table**: `SESSION #`, `PARTS`, `COUNT` (Automatic pulses), `RESULTS` (e.g. `SOUR`).
* **Column Widths & Template Rows**: Proper column spacing to prevent text clipping (`###`), followed by empty template rows with `-` matching your physical card.

---

## 5. Database Backup & How to Recover / Restore It

All client files and spreadsheets are stored locally in:
```
data\clinic.db
```

### How to Download a Backup:
1. In the top bar, click **"Database Backup & Restore"**.
2. Click **"Download Database File (.db)"** (or **"Download Master Excel (.xlsx)"**).
3. Save the file to a USB flash drive or your backup folder.

### How to Recover / Restore Your Database:
You have **two easy ways** to recover your data:

#### Method A: 1-Click Upload Restore (Inside the App)
1. Open **"Database Backup & Restore"**.
2. Under **"2. How to Recover & Restore Your Backup"**, click **"Upload & Restore .db"**.
3. Select your saved `clinic_backup.db` file.
4. The system validates the database, creates an automatic safety snapshot of the existing database, restores your backup, and reloads all records instantly!

#### Method B: Manual File Copy (If Replacing the PC)
1. Copy your backup file.
2. Rename it to **`clinic.db`**.
3. Paste it inside the **`data\`** folder in the app folder (`c:\Users\Moe\Desktop\medika app\data\clinic.db`).
4. Run **`start-medika.bat`** and all your clients and history will be loaded.

---

## 6. Changing Clinic Logo & Theme Colors

### Uploading Your Custom Logo:
1. Click the **Settings icon (⚙️)**.
2. In the **"Clinic Logo"** box, click **"Upload Logo"**.
3. Choose your clinic's image file (`.png`, `.jpg`, `.svg`).
4. The logo immediately appears in the top navigation bar and on printable client sheets!
5. To revert to the default icon, simply click the **Trash icon**.

### Theme Color Customization:
Click on any of the 6 color palettes in Settings:
* 🌸 **Rose Beauty** (Blush pink — default for beauty/laser clinics)
* 🌊 **Clinical Teal** (Medical cyan)
* 💎 **Royal Blue** (Professional corporate blue)
* 🌿 **Emerald Green** (Fresh wellness green)
* 🔮 **Lavender Violet** (Luxury aesthetic purple)
* 🌑 **Slate Gray** (Modern monochrome)

Click **"Apply & Save Settings"** — all buttons, active tabs, token badges, and highlights immediately switch to your selected color theme!

---

## 7. Modifying Doctors, Specialists & Machine Roster

1. Click **"Staff & Doctors"** in the top navigation bar.
2. View and manage your active staff:
   - `ELVANA` (Laser Specialist, Machine 5)
   - `NANCY` (Laser Specialist, Machine 5)
   - `ZEINA` (Aesthetician, Machine 5)
   - `NTHALEI` (Laser Technician, Machine 5)
   - `Dr. Sarah Jenkins` (Medical Director & Dermatologist)
3. Click the **Pencil icon** to modify their name or room/machine.
4. Click **"+ Add Staff Member"** to add a new employee.

---

## 8. Modifying Client Data & Skin Types

1. Go to **"Clients & Session Spreadsheets"**.
2. Click the **Pencil icon (Modify Client Details)** next to any patient:
   - Edit Full Name, Phone, File Code, Skin Type (Type 1 to 6), Notices, and Notes.
3. Click **"Open Client Sheet"** to enter new sessions, record start/end counts, and calculate pulses automatically!
