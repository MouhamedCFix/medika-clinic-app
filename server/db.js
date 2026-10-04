const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

// Ensure data and uploads directories exist
const dataDir = path.join(__dirname, '..', 'data');
const uploadsDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

let dbPath = path.join(dataDir, 'clinic.db');
let db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

// Password hashing helper (SHA-256 with salt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + '_medika_salt_2026').digest('hex');
}

// 0. Users & Security Accounts Table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    display_name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );
`);

// Seed default Boss & Staff accounts if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const insertUser = db.prepare('INSERT INTO users (username, password_hash, role, display_name) VALUES (?, ?, ?, ?)');
  insertUser.run('boss', hashPassword('boss123'), 'boss', 'Clinic Director / Boss');
  insertUser.run('reception', hashPassword('staff123'), 'staff', 'Reception Desk');
}

// 1. Clinic Settings Table
db.exec(`
  CREATE TABLE IF NOT EXISTS clinic_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// 2. Doctors & Specialists Roster
db.exec(`
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT,
    room TEXT,
    phone TEXT,
    is_active INTEGER DEFAULT 1
  );
`);

// 3. Patients Table (with skin_type for beauty/laser clinic)
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    dob TEXT,
    gender TEXT,
    skin_type TEXT,
    blood_type TEXT,
    allergies TEXT,
    emergency_contact TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );
`);

// Helper to safely add column if missing
function ensureColumn(table, column, definition) {
  try {
    const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all();
    const exists = tableInfo.some(col => col.name === column);
    if (!exists) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  } catch (err) {
    console.error(`Error ensuring column ${column} on ${table}:`, err.message);
  }
}

// 4. Patient Sheet Rows (Beauty, Laser & Medical Session Log)
db.exec(`
  CREATE TABLE IF NOT EXISTS patient_sheet_rows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    visit_date TEXT NOT NULL,
    machine_no TEXT,
    package_name TEXT,
    session_no INTEGER,
    skin_type TEXT,
    energy TEXT,
    start_count INTEGER,
    end_count INTEGER,
    pulse_count INTEGER,
    employee_name TEXT,
    mc_status TEXT,
    parts TEXT,
    results_notes TEXT,
    service_treatment TEXT,
    doctor_name TEXT,
    diagnosis_notes TEXT,
    prescription TEXT,
    fee REAL DEFAULT 0,
    paid REAL DEFAULT 0,
    payment_status TEXT DEFAULT 'Paid',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
  );
`);

ensureColumn('patients', 'skin_type', 'TEXT');
ensureColumn('patient_sheet_rows', 'machine_no', 'TEXT');
ensureColumn('patient_sheet_rows', 'package_name', 'TEXT');
ensureColumn('patient_sheet_rows', 'session_no', 'INTEGER');
ensureColumn('patient_sheet_rows', 'skin_type', 'TEXT');
ensureColumn('patient_sheet_rows', 'energy', 'TEXT');
ensureColumn('patient_sheet_rows', 'start_count', 'INTEGER');
ensureColumn('patient_sheet_rows', 'end_count', 'INTEGER');
ensureColumn('patient_sheet_rows', 'pulse_count', 'INTEGER');
ensureColumn('patient_sheet_rows', 'employee_name', 'TEXT');
ensureColumn('patient_sheet_rows', 'mc_status', 'TEXT');
ensureColumn('patient_sheet_rows', 'parts', 'TEXT');
ensureColumn('patient_sheet_rows', 'results_notes', 'TEXT');

// 5. Reception Queue Table
db.exec(`
  CREATE TABLE IF NOT EXISTS reception_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    queue_number INTEGER NOT NULL,
    check_in_time TEXT NOT NULL,
    doctor_assigned TEXT,
    room TEXT,
    reason_for_visit TEXT,
    status TEXT NOT NULL DEFAULT 'Waiting',
    created_at TEXT DEFAULT (date('now', 'localtime')),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
  );
`);

// 6. Appointments Table
db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    doctor_name TEXT,
    reason TEXT,
    package_name TEXT,
    status TEXT DEFAULT 'Scheduled',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
  );
`);
ensureColumn('appointments', 'package_name', 'TEXT');

// Settings Helpers
const getSetting = (key) => {
  const row = db.prepare('SELECT value FROM clinic_settings WHERE key = ?').get(key);
  return row ? row.value : null;
};

const setSetting = (key, value) => {
  db.prepare('INSERT INTO clinic_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(key, value, value);
};

if (!getSetting('clinic_name')) {
  setSetting('clinic_name', 'MEDIKA BEAUTY CLINIC');
  setSetting('subtitle', 'Laser, Aesthetic & Skin Care Center');
  setSetting('theme_color', 'rose');
  setSetting('phone', '+1 (555) 789-9278');
  setSetting('address', 'Medical & Beauty Tower, Suite 200');
  setSetting('currency_symbol', '$');
  setSetting('logo_url', '');
}

// Function to reload DB connection (used after restore)
function reloadDatabase() {
  try {
    db.close();
  } catch (e) {}
  db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);
  return db;
}

module.exports = {
  get db() { return db; },
  dbPath,
  dataDir,
  uploadsDir,
  getSetting,
  setSetting,
  hashPassword,
  reloadDatabase
};
