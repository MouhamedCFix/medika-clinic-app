const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const multer = require('multer');
const XLSX = require('xlsx');
const { 
  db, 
  dbPath, 
  dataDir, 
  uploadsDir, 
  getSetting, 
  setSetting, 
  hashPassword, 
  reloadDatabase 
} = require('./db.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Multer memory storage for uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

app.use(cors());
app.use(express.json());

// Helper: Get local network IPv4 address for multi-computer clinic access
function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// ==========================================
// AUTHENTICATION & SECURITY
// ==========================================
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const hash = hashPassword(password);
    const user = db.prepare('SELECT id, username, role, display_name FROM users WHERE LOWER(username) = LOWER(?) AND password_hash = ?').get(username.trim(), hash);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = Buffer.from(`${user.username}:${user.role}:${Date.now()}`).toString('base64');
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.display_name,
        token
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/change-password', (req, res) => {
  try {
    const { username, old_password, new_password } = req.body;
    if (!username || !old_password || !new_password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const oldHash = hashPassword(old_password);
    const user = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND password_hash = ?').get(username.trim(), oldHash);

    if (!user) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = hashPassword(new_password);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, user.id);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CLINIC LOGO & SETTINGS
// ==========================================
app.get('/api/logo', (req, res) => {
  const logoPath = path.join(uploadsDir, 'clinic_logo.png');
  if (fs.existsSync(logoPath)) {
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.sendFile(logoPath);
  }
  res.status(404).send('No custom logo uploaded');
});

app.post('/api/settings/logo', upload.single('logoFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No logo file provided' });
    }

    const logoPath = path.join(uploadsDir, 'clinic_logo.png');
    fs.writeFileSync(logoPath, req.file.buffer);
    const logoUrl = `/api/logo?t=${Date.now()}`;
    setSetting('logo_url', logoUrl);

    res.json({ success: true, logoUrl, message: 'Logo uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/settings/logo', (req, res) => {
  try {
    const logoPath = path.join(uploadsDir, 'clinic_logo.png');
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }
    setSetting('logo_url', '');
    res.json({ success: true, message: 'Logo reset to default' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM clinic_settings').all();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });

    const localIp = getLocalNetworkIp();
    res.json({
      ...settings,
      localIp,
      lanUrl: `http://${localIp}:3000`,
      serverLanUrl: `http://${localIp}:5000`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const { clinic_name, subtitle, theme_color, phone, address, currency_symbol, logo_url } = req.body;
    if (clinic_name) setSetting('clinic_name', clinic_name);
    if (subtitle !== undefined) setSetting('subtitle', subtitle);
    if (theme_color) setSetting('theme_color', theme_color);
    if (phone !== undefined) setSetting('phone', phone);
    if (address !== undefined) setSetting('address', address);
    if (currency_symbol) setSetting('currency_symbol', currency_symbol);
    if (logo_url !== undefined) setSetting('logo_url', logo_url);

    res.json({ success: true, message: 'Clinic settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/status', (req, res) => {
  try {
    const stats = fs.statSync(dbPath);
    const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
    const sheetRowCount = db.prepare('SELECT COUNT(*) as count FROM patient_sheet_rows').get().count;
    const todayQueueCount = db.prepare("SELECT COUNT(*) as count FROM reception_queue WHERE created_at = date('now', 'localtime')").get().count;
    const localIp = getLocalNetworkIp();

    res.json({
      status: 'online',
      storage: 'local_sqlite',
      databasePath: dbPath,
      fileSizeBytes: stats.size,
      patientCount,
      sheetRowCount,
      todayQueueCount,
      localIp,
      lanUrl: `http://${localIp}:3000`,
      clinicName: getSetting('clinic_name') || 'MEDIKA BEAUTY CLINIC',
      logoUrl: getSetting('logo_url') || '',
      themeColor: getSetting('theme_color') || 'rose',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// DOCTORS & SPECIALISTS
// ==========================================
app.get('/api/doctors', (req, res) => {
  try {
    const doctors = db.prepare('SELECT * FROM doctors ORDER BY is_active DESC, name ASC').all();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/doctors', (req, res) => {
  try {
    const { name, specialty, room, phone } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const stmt = db.prepare('INSERT INTO doctors (name, specialty, room, phone, is_active) VALUES (?, ?, ?, ?, 1)');
    const result = stmt.run(name.trim(), specialty || 'Laser Specialist', room || 'Machine 5', phone || '');
    const created = db.prepare('SELECT * FROM doctors WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/doctors/:id', (req, res) => {
  try {
    const { name, specialty, room, phone, is_active } = req.body;
    const stmt = db.prepare(`
      UPDATE doctors
      SET name = COALESCE(?, name),
          specialty = COALESCE(?, specialty),
          room = COALESCE(?, room),
          phone = COALESCE(?, phone),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `);

    stmt.run(name, specialty, room, phone, is_active, Number(req.params.id));
    const updated = db.prepare('SELECT * FROM doctors WHERE id = ?').get(Number(req.params.id));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/doctors/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM doctors WHERE id = ?').run(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// PATIENTS DIRECTORY
// ==========================================
app.get('/api/patients', (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search.trim()}%` : null;
    let patients;

    if (search) {
      patients = db.prepare(`
        SELECT p.*,
          (SELECT COUNT(*) FROM patient_sheet_rows WHERE patient_id = p.id) as total_visits,
          (SELECT MAX(visit_date) FROM patient_sheet_rows WHERE patient_id = p.id) as last_visit
        FROM patients p
        WHERE p.full_name LIKE ? OR p.phone LIKE ? OR p.file_number LIKE ?
        ORDER BY p.id DESC
      `).all(search, search, search);
    } else {
      patients = db.prepare(`
        SELECT p.*,
          (SELECT COUNT(*) FROM patient_sheet_rows WHERE patient_id = p.id) as total_visits,
          (SELECT MAX(visit_date) FROM patient_sheet_rows WHERE patient_id = p.id) as last_visit
        FROM patients p
        ORDER BY p.id DESC
      `).all();
    }
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/patients/:id', (req, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(Number(req.params.id));
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const sheetRows = db.prepare(`
      SELECT * FROM patient_sheet_rows
      WHERE patient_id = ?
      ORDER BY session_no DESC, visit_date DESC, id DESC
    `).all(patient.id);

    res.json({ ...patient, sheetRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients', (req, res) => {
  try {
    const { full_name, phone, dob, gender, skin_type, blood_type, allergies, emergency_contact, notes } = req.body;
    let { file_number } = req.body;

    if (!full_name || !phone) {
      return res.status(400).json({ error: 'Full name and phone number are required' });
    }

    if (!file_number) {
      file_number = phone.replace(/[^0-9]/g, '');
      if (!file_number || file_number.length < 4) {
        const maxId = db.prepare('SELECT MAX(id) as max_id FROM patients').get().max_id || 0;
        file_number = `MED-${1000 + maxId + 1}`;
      }
    }

    const stmt = db.prepare(`
      INSERT INTO patients (file_number, full_name, phone, dob, gender, skin_type, blood_type, allergies, emergency_contact, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      file_number.trim(),
      full_name.trim(),
      phone.trim(),
      dob || '',
      gender || 'Female',
      skin_type || 'Type 3',
      blood_type || '',
      allergies || '',
      emergency_contact || '',
      notes || ''
    );

    const created = db.prepare('SELECT * FROM patients WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/patients/:id', (req, res) => {
  try {
    const { full_name, phone, dob, gender, skin_type, blood_type, allergies, emergency_contact, notes, file_number } = req.body;
    const stmt = db.prepare(`
      UPDATE patients
      SET file_number = COALESCE(?, file_number),
          full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          dob = COALESCE(?, dob),
          gender = COALESCE(?, gender),
          skin_type = COALESCE(?, skin_type),
          blood_type = COALESCE(?, blood_type),
          allergies = COALESCE(?, allergies),
          emergency_contact = COALESCE(?, emergency_contact),
          notes = COALESCE(?, notes)
      WHERE id = ?
    `);

    stmt.run(
      file_number,
      full_name,
      phone,
      dob,
      gender,
      skin_type,
      blood_type,
      allergies,
      emergency_contact,
      notes,
      Number(req.params.id)
    );

    const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(Number(req.params.id));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/patients/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM patient_sheet_rows WHERE patient_id = ?').run(Number(req.params.id));
    db.prepare('DELETE FROM reception_queue WHERE patient_id = ?').run(Number(req.params.id));
    db.prepare('DELETE FROM appointments WHERE patient_id = ?').run(Number(req.params.id));
    db.prepare('DELETE FROM patients WHERE id = ?').run(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CLIENT SPREADSHEET ROWS
// ==========================================
app.get('/api/patients/:id/sheet', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM patient_sheet_rows
      WHERE patient_id = ?
      ORDER BY session_no ASC, visit_date ASC, id ASC
    `).all(Number(req.params.id));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients/:id/sheet', (req, res) => {
  try {
    const patientId = Number(req.params.id);
    const {
      visit_date,
      machine_no,
      package_name,
      session_no,
      skin_type,
      energy,
      start_count,
      end_count,
      employee_name,
      mc_status,
      parts,
      results_notes,
      service_treatment,
      doctor_name,
      fee,
      paid,
      payment_status,
      notes
    } = req.body;

    const sCount = Number(start_count) || 0;
    const eCount = Number(end_count) || 0;
    const pulseCount = (eCount && sCount) ? (eCount - sCount) : (Number(req.body.pulse_count) || 0);

    const stmt = db.prepare(`
      INSERT INTO patient_sheet_rows (
        patient_id, visit_date, machine_no, package_name, session_no,
        skin_type, energy, start_count, end_count, pulse_count,
        employee_name, mc_status, parts, results_notes, service_treatment,
        doctor_name, fee, paid, payment_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      patientId,
      visit_date || new Date().toISOString().split('T')[0],
      machine_no || '5',
      package_name || 'FULL #1',
      session_no ? Number(session_no) : null,
      skin_type || '3',
      energy || '40',
      sCount,
      eCount,
      pulseCount,
      employee_name || 'ELVANA',
      mc_status || 'OK',
      parts || package_name || 'FULL #1',
      results_notes || '',
      service_treatment || package_name || 'Laser Hair Removal',
      doctor_name || employee_name || '',
      Number(fee || 0),
      Number(paid || 0),
      payment_status || 'Paid',
      notes || ''
    );

    const created = db.prepare('SELECT * FROM patient_sheet_rows WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/patients/:id/sheet/:rowId', (req, res) => {
  try {
    const {
      visit_date,
      machine_no,
      package_name,
      session_no,
      skin_type,
      energy,
      start_count,
      end_count,
      employee_name,
      mc_status,
      parts,
      results_notes,
      service_treatment,
      doctor_name,
      fee,
      paid,
      payment_status,
      notes
    } = req.body;

    const sCount = Number(start_count) || 0;
    const eCount = Number(end_count) || 0;
    const pulseCount = (eCount && sCount) ? (eCount - sCount) : (Number(req.body.pulse_count) || 0);

    const stmt = db.prepare(`
      UPDATE patient_sheet_rows
      SET visit_date = COALESCE(?, visit_date),
          machine_no = COALESCE(?, machine_no),
          package_name = COALESCE(?, package_name),
          session_no = COALESCE(?, session_no),
          skin_type = COALESCE(?, skin_type),
          energy = COALESCE(?, energy),
          start_count = COALESCE(?, start_count),
          end_count = COALESCE(?, end_count),
          pulse_count = COALESCE(?, pulse_count),
          employee_name = COALESCE(?, employee_name),
          mc_status = COALESCE(?, mc_status),
          parts = COALESCE(?, parts),
          results_notes = COALESCE(?, results_notes),
          service_treatment = COALESCE(?, service_treatment),
          doctor_name = COALESCE(?, doctor_name),
          fee = COALESCE(?, fee),
          paid = COALESCE(?, paid),
          payment_status = COALESCE(?, payment_status),
          notes = COALESCE(?, notes)
      WHERE id = ? AND patient_id = ?
    `);

    stmt.run(
      visit_date,
      machine_no,
      package_name,
      session_no ? Number(session_no) : undefined,
      skin_type,
      energy,
      sCount,
      eCount,
      pulseCount,
      employee_name,
      mc_status,
      parts,
      results_notes,
      service_treatment,
      doctor_name,
      fee !== undefined ? Number(fee) : undefined,
      paid !== undefined ? Number(paid) : undefined,
      payment_status,
      notes,
      Number(req.params.rowId),
      Number(req.params.id)
    );

    const updated = db.prepare('SELECT * FROM patient_sheet_rows WHERE id = ?').get(Number(req.params.rowId));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/patients/:id/sheet/:rowId', (req, res) => {
  try {
    db.prepare('DELETE FROM patient_sheet_rows WHERE id = ? AND patient_id = ?').run(
      Number(req.params.rowId),
      Number(req.params.id)
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// EXCEL EXPORT (HIGHLY FORMATTED MATCHING CLINIC IMAGE)
// ==========================================
app.get('/api/patients/:id/export-excel', (req, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(Number(req.params.id));
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const rows = db.prepare(`
      SELECT * FROM patient_sheet_rows
      WHERE patient_id = ?
      ORDER BY session_no ASC, visit_date ASC
    `).all(patient.id);

    const clinicTitle = getSetting('clinic_name') || 'MEDIKA BEAUTY CLINIC';

    // Construct sheet matching user image structure exactly:
    // Left Table (Cols A..J), Gap (Col K), Right Table (Cols L..O)
    const sheetData = [];

    // Row 1: Merged Title
    sheetData.push(['', '', clinicTitle, '', '', '', '', '', '', '', '', '', '', '', '']);

    // Row 2: File Number
    sheetData.push(['', 'NO :', patient.file_number, '', '', '', '', '', '', '', '', '', '', '', '']);

    // Row 3: Name & Phone
    sheetData.push(['', 'NAME :', patient.full_name, patient.phone, '', '', '', '', '', '', '', '', '', '', '']);

    // Row 4: Blank separator
    sheetData.push([]);

    // Row 5: Column Headers
    sheetData.push([
      'DATE',
      'MACHINE',
      'PACKAGE',
      'S#',
      'SKIN TYPE',
      'ENERGY',
      'START COUNT',
      'END COUNT',
      'EMPLOYEE',
      'M/C',
      '', // Gap
      'SESSION #',
      'PARTS',
      'COUNT',
      'RESULTS'
    ]);

    // Rows 6+: Client Session Data
    rows.forEach(r => {
      const pCount = r.pulse_count || ((r.end_count && r.start_count) ? (r.end_count - r.start_count) : 0);
      sheetData.push([
        r.visit_date,
        r.machine_no || '5',
        r.package_name || 'FULL #1',
        r.session_no || '',
        r.skin_type || '',
        r.energy || '',
        r.start_count ? Number(r.start_count) : '',
        r.end_count ? Number(r.end_count) : '',
        r.employee_name || '',
        r.mc_status || 'OK',
        '', // Gap
        r.session_no || '',
        r.parts || r.package_name || 'FULL #1',
        pCount,
        r.results_notes || ''
      ]);
    });

    // Add empty template rows with '-' to replicate their exact clinic card sheet!
    const emptyRowsToAdd = Math.max(10, 15 - rows.length);
    for (let i = 0; i < emptyRowsToAdd; i++) {
      sheetData.push([
        '-', '-', '-', '-', '-', '-', '-', '-', '-', '-',
        '',
        '-', '-', 0, ''
      ]);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Apply exact Column Widths
    ws['!cols'] = [
      { wch: 12 }, // DATE
      { wch: 9 },  // MACHINE
      { wch: 15 }, // PACKAGE
      { wch: 6 },  // S#
      { wch: 11 }, // SKIN TYPE
      { wch: 9 },  // ENERGY
      { wch: 14 }, // START COUNT
      { wch: 14 }, // END COUNT
      { wch: 13 }, // EMPLOYEE
      { wch: 8 },  // M/C
      { wch: 4 },  // Gap
      { wch: 11 }, // SESSION #
      { wch: 14 }, // PARTS
      { wch: 10 }, // COUNT
      { wch: 16 }  // RESULTS
    ];

    // Merges for header
    ws['!merges'] = [
      { s: { r: 0, c: 2 }, e: { r: 0, c: 8 } }, // MEDIKA BEAUTY CLINIC merged
      { s: { r: 1, c: 2 }, e: { r: 1, c: 4 } }, // NO value
      { s: { r: 2, c: 2 }, e: { r: 2, c: 4 } }  // Name value
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Client Session Sheet');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const safeName = patient.full_name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${patient.file_number}_${safeName}_Beauty_Spreadsheet.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// APPOINTMENTS WITH DOUBLE-BOOKING CONFLICT CHECK
// ==========================================
app.get('/api/appointments', (req, res) => {
  try {
    const { date } = req.query;
    let query = `
      SELECT a.*, p.file_number, p.full_name, p.phone, p.skin_type
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
    `;
    const params = [];

    if (date) {
      query += ` WHERE a.appointment_date = ?`;
      params.push(date);
    }

    query += ` ORDER BY a.appointment_date ASC, a.appointment_time ASC`;
    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', (req, res) => {
  try {
    const { patient_id, appointment_date, appointment_time, doctor_name, reason, package_name } = req.body;
    if (!patient_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Patient, date, and time are required' });
    }

    const docName = (doctor_name || 'ELVANA').trim();

    // DOUBLE-BOOKING CONFLICT CHECK:
    // A staff member cannot be in two appointments simultaneously!
    const conflict = db.prepare(`
      SELECT a.*, p.full_name as client_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE LOWER(a.doctor_name) = LOWER(?)
        AND a.appointment_date = ?
        AND a.appointment_time = ?
        AND a.status != 'Cancelled'
      LIMIT 1
    `).get(docName, appointment_date, appointment_time);

    if (conflict) {
      return res.status(409).json({
        error: `Schedule Conflict: Specialist "${docName}" already has an appointment at ${appointment_time} on ${appointment_date} with client "${conflict.client_name}". Two appointments cannot overlap for the same staff member.`
      });
    }

    const stmt = db.prepare(`
      INSERT INTO appointments (patient_id, appointment_date, appointment_time, doctor_name, reason, package_name, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Scheduled')
    `);

    const result = stmt.run(
      Number(patient_id),
      appointment_date,
      appointment_time,
      docName,
      reason || 'Session Appointment',
      package_name || 'FULL #1'
    );

    const created = db.prepare(`
      SELECT a.*, p.file_number, p.full_name, p.phone, p.skin_type
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = ?
    `).get(Number(result.lastInsertRowid));

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id', (req, res) => {
  try {
    const { patient_id, appointment_date, appointment_time, doctor_name, reason, package_name, status } = req.body;
    const current = db.prepare('SELECT * FROM appointments WHERE id = ?').get(Number(req.params.id));
    if (!current) return res.status(404).json({ error: 'Appointment not found' });

    const newDoc = (doctor_name !== undefined ? doctor_name : current.doctor_name).trim();
    const newDate = appointment_date || current.appointment_date;
    const newTime = appointment_time || current.appointment_time;
    const newStatus = status || current.status;

    // Check conflict if appointment is active
    if (newStatus !== 'Cancelled') {
      const conflict = db.prepare(`
        SELECT a.*, p.full_name as client_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE LOWER(a.doctor_name) = LOWER(?)
          AND a.appointment_date = ?
          AND a.appointment_time = ?
          AND a.status != 'Cancelled'
          AND a.id != ?
        LIMIT 1
      `).get(newDoc, newDate, newTime, Number(req.params.id));

      if (conflict) {
        return res.status(409).json({
          error: `Schedule Conflict: Specialist "${newDoc}" already has an appointment at ${newTime} on ${newDate} with client "${conflict.client_name}". Please pick another time or specialist.`
        });
      }
    }

    const stmt = db.prepare(`
      UPDATE appointments
      SET patient_id = COALESCE(?, patient_id),
          appointment_date = COALESCE(?, appointment_date),
          appointment_time = COALESCE(?, appointment_time),
          doctor_name = COALESCE(?, doctor_name),
          reason = COALESCE(?, reason),
          package_name = COALESCE(?, package_name),
          status = COALESCE(?, status)
      WHERE id = ?
    `);

    stmt.run(
      patient_id ? Number(patient_id) : undefined,
      appointment_date,
      appointment_time,
      newDoc,
      reason,
      package_name,
      status,
      Number(req.params.id)
    );

    const updated = db.prepare(`
      SELECT a.*, p.file_number, p.full_name, p.phone, p.skin_type
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = ?
    `).get(Number(req.params.id));

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments/:id/check-in', (req, res) => {
  try {
    const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(Number(req.params.id));
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const today = new Date().toISOString().split('T')[0];
    const maxQueue = db.prepare('SELECT MAX(queue_number) as max_q FROM reception_queue WHERE created_at = ?').get(today).max_q || 0;
    const queueNumber = maxQueue + 1;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const insertQueue = db.prepare(`
      INSERT INTO reception_queue (patient_id, queue_number, check_in_time, doctor_assigned, room, reason_for_visit, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Waiting', ?)
    `);

    const qRes = insertQueue.run(
      appt.patient_id,
      queueNumber,
      timeStr,
      appt.doctor_name || 'ELVANA',
      'Machine 5',
      appt.package_name ? `${appt.package_name} - ${appt.reason}` : appt.reason,
      today
    );

    db.prepare("UPDATE appointments SET status = 'Checked In' WHERE id = ?").run(appt.id);

    const queueItem = db.prepare(`
      SELECT q.*, p.file_number, p.full_name, p.phone
      FROM reception_queue q
      JOIN patients p ON q.patient_id = p.id
      WHERE q.id = ?
    `).get(Number(qRes.lastInsertRowid));

    res.json({
      success: true,
      message: `Checked in as Token #${queueNumber} in Waiting Room!`,
      queueItem
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/appointments/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM appointments WHERE id = ?').run(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// RECEPTION QUEUE
// ==========================================
app.get('/api/queue', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const queue = db.prepare(`
      SELECT
        q.*,
        p.file_number,
        p.full_name,
        p.phone,
        p.skin_type,
        p.blood_type,
        p.allergies
      FROM reception_queue q
      JOIN patients p ON q.patient_id = p.id
      WHERE q.created_at = ?
      ORDER BY
        CASE q.status
          WHEN 'In Consultation' THEN 1
          WHEN 'Waiting' THEN 2
          WHEN 'Completed' THEN 3
          WHEN 'Cancelled' THEN 4
          ELSE 5
        END,
        q.queue_number ASC
    `).all(today);

    res.json(queue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/queue', (req, res) => {
  try {
    const { patient_id, doctor_assigned, room, reason_for_visit } = req.body;
    if (!patient_id) return res.status(400).json({ error: 'Patient ID required' });

    const today = new Date().toISOString().split('T')[0];
    const maxQueue = db.prepare('SELECT MAX(queue_number) as max_q FROM reception_queue WHERE created_at = ?').get(today).max_q || 0;
    const queueNumber = maxQueue + 1;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const stmt = db.prepare(`
      INSERT INTO reception_queue (patient_id, queue_number, check_in_time, doctor_assigned, room, reason_for_visit, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Waiting', ?)
    `);

    const result = stmt.run(
      Number(patient_id),
      queueNumber,
      timeStr,
      doctor_assigned || 'Specialist on duty',
      room || 'Machine 5',
      reason_for_visit || 'Session Check-In',
      today
    );

    const created = db.prepare(`
      SELECT q.*, p.file_number, p.full_name, p.phone
      FROM reception_queue q
      JOIN patients p ON q.patient_id = p.id
      WHERE q.id = ?
    `).get(Number(result.lastInsertRowid));

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/queue/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE reception_queue SET status = ? WHERE id = ?').run(status, Number(req.params.id));
    const updated = db.prepare('SELECT * FROM reception_queue WHERE id = ?').get(Number(req.params.id));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/queue/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM reception_queue WHERE id = ?').run(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// MASTER CLINIC SPREADSHEET
// ==========================================
app.get('/api/master-sheet', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        r.*,
        p.file_number,
        p.full_name,
        p.phone,
        p.dob,
        p.gender,
        p.skin_type as patient_skin_type
      FROM patient_sheet_rows r
      JOIN patients p ON r.patient_id = p.id
      ORDER BY r.visit_date DESC, r.id DESC
    `).all();

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/export-master-excel', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        p.file_number AS "File #",
        p.full_name AS "Client Name",
        p.phone AS "Phone",
        r.visit_date AS "Date",
        r.machine_no AS "Machine",
        r.package_name AS "Package",
        r.session_no AS "S#",
        r.skin_type AS "Skin Type",
        r.energy AS "Energy (J)",
        r.start_count AS "Start Count",
        r.end_count AS "End Count",
        r.pulse_count AS "Pulse Count",
        r.employee_name AS "Employee / Specialist",
        r.mc_status AS "M/C",
        r.results_notes AS "Results / Notes"
      FROM patient_sheet_rows r
      JOIN patients p ON r.patient_id = p.id
      ORDER BY r.visit_date DESC
    `).all();

    const patients = db.prepare('SELECT * FROM patients ORDER BY id ASC').all();
    const wb = XLSX.utils.book_new();

    const wsVisits = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, wsVisits, 'All Clinic Sessions');

    const wsPatients = XLSX.utils.json_to_sheet(patients);
    XLSX.utils.book_append_sheet(wb, wsPatients, 'Clients Directory');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const today = new Date().toISOString().split('T')[0];
    const fileName = `Medika_Clinic_Master_${today}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// DATABASE BACKUP & RESTORE RECOVERY
// ==========================================
app.get('/api/backup/download-db', (req, res) => {
  try {
    res.download(dbPath, 'clinic_backup.db');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restore / Recover database from uploaded .db file
app.post('/api/backup/restore', upload.single('backupFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No backup file uploaded' });
    }

    // Verify it is a valid SQLite database header ("SQLite format 3\000")
    const header = req.file.buffer.subarray(0, 16).toString();
    if (!header.startsWith('SQLite format 3')) {
      return res.status(400).json({ error: 'Uploaded file is not a valid SQLite database file.' });
    }

    // Safety backup of existing database first
    const safetyBackupPath = path.join(dataDir, `clinic_pre_restore_${Date.now()}.db`);
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, safetyBackupPath);
    }

    // Overwrite clinic.db with uploaded buffer
    fs.writeFileSync(dbPath, req.file.buffer);

    // Reload DB connection
    reloadDatabase();

    const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
    res.json({
      success: true,
      message: `Database successfully restored! Loaded ${patientCount} client records.`,
      patientCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore database: ' + err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalNetworkIp();
  console.log(`Medika Server running locally on http://localhost:${PORT}`);
  console.log(`Clinic LAN Network URL: http://${localIp}:${PORT}`);
  console.log(`Local SQLite Database at: ${dbPath}`);
});
