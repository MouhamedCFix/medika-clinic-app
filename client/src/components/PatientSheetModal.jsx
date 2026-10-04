import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  Edit2, 
  Check, 
  AlertCircle,
  Phone,
  Sparkles,
  Info,
  Calculator
} from 'lucide-react';

export default function PatientSheetModal({ 
  patientId, 
  onClose, 
  doctors = [] 
}) {
  const [patient, setPatient] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Default next session number
  const nextSessionNo = (rows.length || 0) + 1;

  // New row form state matching the user's Excel sheet image
  const [newRow, setNewRow] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    machine_no: '5',
    package_name: 'FULL #1',
    session_no: nextSessionNo,
    skin_type: '3',
    energy: '40',
    start_count: '',
    end_count: '',
    pulse_count: '',
    employee_name: doctors[0]?.name || 'ELVANA',
    mc_status: 'OK',
    parts: 'FULL #1',
    results_notes: ''
  });

  // Load patient data & their session rows
  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/patients/${patientId}`);
      if (!res.ok) throw new Error('Failed to load patient');
      const data = await res.json();
      setPatient(data);
      setRows(data.sheetRows || []);
      setNewRow(prev => ({ ...prev, session_no: (data.sheetRows?.length || 0) + 1 }));
    } catch (err) {
      console.error(err);
      alert('Error loading client spreadsheet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  // Auto-calculate pulse count for new row
  const handleCountChange = (field, value) => {
    const updated = { ...newRow, [field]: value };
    const s = Number(field === 'start_count' ? value : updated.start_count);
    const e = Number(field === 'end_count' ? value : updated.end_count);
    if (e && s && e >= s) {
      updated.pulse_count = e - s;
    }
    setNewRow(updated);
  };

  // Auto-calculate pulse count for edit row
  const handleEditCountChange = (field, value) => {
    const updated = { ...editFormData, [field]: value };
    const s = Number(field === 'start_count' ? value : updated.start_count);
    const e = Number(field === 'end_count' ? value : updated.end_count);
    if (e && s && e >= s) {
      updated.pulse_count = e - s;
    }
    setEditFormData(updated);
  };

  // Add new session row into SQLite
  const handleAddRow = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/patients/${patientId}/sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRow)
      });
      if (!res.ok) throw new Error('Failed to save session to local database');
      const createdRow = await res.json();
      setRows([createdRow, ...rows]);
      setIsAddingRow(false);
      // Reset form with incremented session number
      setNewRow({
        visit_date: new Date().toISOString().split('T')[0],
        machine_no: '5',
        package_name: 'FULL #1',
        session_no: rows.length + 2,
        skin_type: '3',
        energy: '40',
        start_count: '',
        end_count: '',
        pulse_count: '',
        employee_name: doctors[0]?.name || 'ELVANA',
        mc_status: 'OK',
        parts: 'FULL #1',
        results_notes: ''
      });
    } catch (err) {
      alert('Database error: ' + err.message);
    }
  };

  const handleStartEdit = (row) => {
    setEditingRowId(row.id);
    setEditFormData({ ...row });
  };

  const handleSaveEdit = async (rowId) => {
    try {
      const res = await fetch(`/api/patients/${patientId}/sheet/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (!res.ok) throw new Error('Failed to update row');
      const updatedRow = await res.json();
      setRows(rows.map(r => r.id === rowId ? updatedRow : r));
      setEditingRowId(null);
    } catch (err) {
      alert('Error updating row: ' + err.message);
    }
  };

  const handleDeleteRow = async (rowId) => {
    if (!window.confirm('Delete this session row from the local database?')) return;
    try {
      const res = await fetch(`/api/patients/${patientId}/sheet/${rowId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete row');
      setRows(rows.filter(r => r.id !== rowId));
    } catch (err) {
      alert('Error deleting row: ' + err.message);
    }
  };

  // Export to Excel matching the exact format from user image
  const handleExportExcel = () => {
    window.location.href = `/api/patients/${patientId}/export-excel`;
  };

  // Calculate total pulses
  const totalPulses = rows.reduce((sum, r) => {
    const pulses = r.pulse_count || ((r.end_count && r.start_count) ? (r.end_count - r.start_count) : 0);
    return sum + (Number(pulses) || 0);
  }, 0);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-slate-700">Loading Client Spreadsheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-7xl max-h-[94vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">{patient?.full_name}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 font-semibold">
                  NO: {patient?.file_number}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Client Session Spreadsheet &bull; Laser & Aesthetic Treatment Log &bull; Local SQLite
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 shadow-sm transition-all"
              title="Download client spreadsheet in Excel format matching your clinic sheet"
            >
              <Download className="w-4 h-4" />
              <span>Export to Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Print Client Sheet"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Client Banner Header (Matching the user's Excel sheet header!) */}
        <div id="printable-patient-sheet" className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-medium">Clinic</span>
              <span className="font-bold text-slate-900">MEDIKA BEAUTY CLINIC</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-medium">Phone / Code</span>
              <span className="font-semibold text-slate-900">{patient?.phone}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-medium">Skin Type</span>
              <span className="font-bold text-rose-700">{patient?.skin_type || 'Type 3'}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-medium">Completed Sessions</span>
              <span className="font-bold text-slate-900">{rows.length} Sessions</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-medium">Total Pulses Fired</span>
              <span className="font-bold text-emerald-700">{totalPulses.toLocaleString()} Pulses</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-medium">Notice / Allergies</span>
              <span className="font-semibold text-amber-700">{patient?.allergies || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Session Spreadsheet</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
              {rows.length} entries
            </span>
          </div>

          <button
            onClick={() => setIsAddingRow(!isAddingRow)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isAddingRow
                ? 'bg-slate-200 text-slate-800'
                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingRow ? 'Cancel' : '+ Add New Session Row'}</span>
          </button>
        </div>

        {/* Add Session Row Form */}
        {isAddingRow && (
          <form onSubmit={handleAddRow} className="p-4 bg-rose-50/70 border-b border-rose-200 no-print animate-in fade-in duration-150">
            <div className="text-xs font-bold text-rose-950 mb-2 flex items-center space-x-1.5">
              <Plus className="w-3.5 h-3.5 text-rose-600" />
              <span>Log Session (Matches Clinic Spreadsheet Columns &bull; Auto-saves to Local SQLite)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-12 gap-2 text-xs">
              
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Date</label>
                <input 
                  type="date" 
                  value={newRow.visit_date}
                  onChange={(e) => setNewRow({ ...newRow, visit_date: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Machine</label>
                <input 
                  type="text" 
                  value={newRow.machine_no}
                  onChange={(e) => setNewRow({ ...newRow, machine_no: e.target.value })}
                  placeholder="5"
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Package</label>
                <input 
                  type="text" 
                  value={newRow.package_name}
                  onChange={(e) => setNewRow({ ...newRow, package_name: e.target.value })}
                  placeholder="FULL #1"
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">S#</label>
                <input 
                  type="number" 
                  value={newRow.session_no}
                  onChange={(e) => setNewRow({ ...newRow, session_no: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Skin</label>
                <input 
                  type="text" 
                  value={newRow.skin_type}
                  onChange={(e) => setNewRow({ ...newRow, skin_type: e.target.value })}
                  placeholder="3"
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Energy (J)</label>
                <input 
                  type="text" 
                  value={newRow.energy}
                  onChange={(e) => setNewRow({ ...newRow, energy: e.target.value })}
                  placeholder="40"
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Start Count</label>
                <input 
                  type="number" 
                  value={newRow.start_count}
                  onChange={(e) => handleCountChange('start_count', e.target.value)}
                  placeholder="e.g. 5173910"
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">End Count</label>
                <input 
                  type="number" 
                  value={newRow.end_count}
                  onChange={(e) => handleCountChange('end_count', e.target.value)}
                  placeholder="e.g. 5181338"
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

            </div>

            {/* Row 2: Employee, M/C, Count, Results, and Save button */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 text-xs mt-2">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Employee / Specialist</label>
                <select 
                  value={newRow.employee_name}
                  onChange={(e) => setNewRow({ ...newRow, employee_name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">M/C</label>
                <input 
                  type="text" 
                  value={newRow.mc_status}
                  onChange={(e) => setNewRow({ ...newRow, mc_status: e.target.value })}
                  placeholder="OK"
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Pulse Count</label>
                <input 
                  type="number" 
                  value={newRow.pulse_count}
                  onChange={(e) => setNewRow({ ...newRow, pulse_count: e.target.value })}
                  placeholder="Auto"
                  className="w-full bg-slate-100 font-bold text-emerald-700 border border-slate-300 rounded p-1.5 text-xs focus:outline-hidden"
                />
              </div>

              <div className="col-span-4">
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Results / Reaction Notes</label>
                <input 
                  type="text" 
                  placeholder="e.g. SOUR, mild redness, good tolerance..."
                  value={newRow.results_notes}
                  onChange={(e) => setNewRow({ ...newRow, results_notes: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-rose-600 text-white font-semibold py-1.5 px-3 rounded hover:bg-rose-700 active:scale-95 transition-all shadow-xs"
                >
                  Save Row to DB
                </button>
              </div>
            </div>
          </form>
        )}

        {/* The Spreadsheet Grid Table (Matches Image!) */}
        <div className="flex-1 overflow-auto bg-white min-h-[340px]">
          {rows.length === 0 ? (
            <div className="p-12 text-center">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No session rows logged for this client yet</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Click "Add New Session Row" to start logging treatments.</p>
              <button
                onClick={() => setIsAddingRow(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Session</span>
              </button>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0 border-b border-slate-300 z-10 text-[11px]">
                <tr>
                  <th className="py-2 px-2 border-r border-slate-300 w-24">DATE</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-16">MACHINE</th>
                  <th className="py-2 px-2 border-r border-slate-300 min-w-[100px]">PACKAGE</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-12">S#</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-14">SKIN TYPE</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-16">ENERGY</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-right w-24">START COUNT</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-right w-24">END COUNT</th>
                  <th className="py-2 px-2 border-r border-slate-300 min-w-[100px]">EMPLOYEE</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-14">M/C</th>
                  <th className="py-2 px-2 border-r border-slate-300 min-w-[90px]">PARTS</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-right w-20 font-bold text-emerald-800">COUNT</th>
                  <th className="py-2 px-2 border-r border-slate-300 min-w-[140px]">RESULTS</th>
                  <th className="py-2 px-2 text-center w-16 no-print">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                {rows.map((row, idx) => {
                  const isEditing = editingRowId === row.id;
                  const pulses = row.pulse_count || ((row.end_count && row.start_count) ? (row.end_count - row.start_count) : 0);

                  if (isEditing) {
                    return (
                      <tr key={row.id} className="bg-amber-50/70 font-sans">
                        <td className="p-1 border-r border-slate-200">
                          <input 
                            type="date"
                            value={editFormData.visit_date}
                            onChange={(e) => setEditFormData({ ...editFormData, visit_date: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-[11px]"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input 
                            type="text"
                            value={editFormData.machine_no}
                            onChange={(e) => setEditFormData({ ...editFormData, machine_no: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-[11px] text-center"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input 
                            type="text"
                            value={editFormData.package_name}
                            onChange={(e) => setEditFormData({ ...editFormData, package_name: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-[11px]"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input 
                            type="number"
                            value={editFormData.session_no}
                            onChange={(e) => setEditFormData({ ...editFormData, session_no: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-[11px] text-center"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input 
                            type="text"
                            value={editFormData.skin_type}
                            onChange={(e) => setEditFormData({ ...editFormData, skin_type: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-[11px] text-center"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input 
                            type="text"
                            value={editFormData.energy}
                            onChange={(e) => setEditFormData({ ...editFormData, energy: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-[11px] text-center"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input 
                            type="number"
                            value={editFormData.start_count}
                            onChange={(e) => handleEditCountChange('start_count', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-[11px] text-right font-mono"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input 
                            type="number"
                            value={editFormData.end_count}
                            onChange={(e) => handleEditCountChange('end_count', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-[11px] text-right font-mono"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <select
                            value={editFormData.employee_name}
                            onChange={(e) => setEditFormData({ ...editFormData, employee_name: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-[11px]"
                          >
                            {doctors.map(d => (
                              <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input 
                            type="text"
                            value={editFormData.mc_status}
                            onChange={(e) => setEditFormData({ ...editFormData, mc_status: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-[11px] text-center"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input 
                            type="text"
                            value={editFormData.parts}
                            onChange={(e) => setEditFormData({ ...editFormData, parts: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-[11px]"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-200 text-right font-bold text-emerald-700">
                          {editFormData.pulse_count || ((editFormData.end_count && editFormData.start_count) ? (editFormData.end_count - editFormData.start_count) : 0)}
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input 
                            type="text"
                            value={editFormData.results_notes}
                            onChange={(e) => setEditFormData({ ...editFormData, results_notes: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded p-1 text-[11px]"
                          />
                        </td>
                        <td className="p-1 text-center no-print space-x-1">
                          <button
                            onClick={() => handleSaveEdit(row.id)}
                            className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingRowId(null)}
                            className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr 
                      key={row.id} 
                      className={`hover:bg-rose-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    >
                      <td className="py-2 px-2 border-r border-slate-200 font-mono text-slate-700 whitespace-nowrap">
                        {row.visit_date}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-800">
                        {row.machine_no || '5'}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 font-sans font-semibold text-slate-900">
                        {row.package_name || row.service_treatment || 'FULL #1'}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-700">
                        {row.session_no || '-'}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-center text-slate-700 font-sans">
                        {row.skin_type || '3'}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-rose-700">
                        {row.energy ? `${row.energy}J` : '-'}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono text-slate-600">
                        {row.start_count ? Number(row.start_count).toLocaleString() : '-'}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono text-slate-600">
                        {row.end_count ? Number(row.end_count).toLocaleString() : '-'}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 font-sans font-bold text-slate-800">
                        {row.employee_name || '-'}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-center">
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          row.mc_status === 'OK' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {row.mc_status || 'OK'}
                        </span>
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 font-sans text-slate-700">
                        {row.parts || row.package_name || 'FULL #1'}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono font-bold text-emerald-700">
                        {Number(pulses).toLocaleString()}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 font-sans text-slate-600">
                        {row.results_notes ? (
                          <span className={row.results_notes.includes('SOUR') ? 'text-rose-600 font-semibold' : ''}>
                            {row.results_notes}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-2 px-2 text-center no-print">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleStartEdit(row)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                            title="Edit row"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer: Totals and Storage info */}
        <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 font-medium">
            Stored in: <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px]">clinic.db &bull; patient_sheet_rows</code>
          </div>

          <div className="flex items-center space-x-6 font-semibold">
            <div>
              <span className="text-slate-500 mr-1.5">Total Sessions Logged:</span>
              <span className="text-slate-900">{rows.length}</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1.5">Cumulative Pulses:</span>
              <span className="text-emerald-700">{totalPulses.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
