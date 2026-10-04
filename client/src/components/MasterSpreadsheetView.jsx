import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  RefreshCw, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function MasterSpreadsheetView({ onOpenPatientSheet }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('All');

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/master-sheet');
      if (!res.ok) throw new Error('Failed to load master sheet');
      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching master sheet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  const handleExportMaster = () => {
    window.location.href = '/api/export-master-excel';
  };

  // Staff list for filter
  const staffList = Array.from(new Set(rows.map(r => r.employee_name || r.doctor_name).filter(Boolean)));

  // Filter rows
  const filteredRows = rows.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      r.full_name?.toLowerCase().includes(searchLower) ||
      r.file_number?.toLowerCase().includes(searchLower) ||
      r.package_name?.toLowerCase().includes(searchLower) ||
      r.results_notes?.toLowerCase().includes(searchLower) ||
      r.employee_name?.toLowerCase().includes(searchLower);
    
    const staffName = r.employee_name || r.doctor_name;
    const matchesStaff = selectedStaff === 'All' || staffName === selectedStaff;
    return matchesSearch && matchesStaff;
  });

  const totalPulses = filteredRows.reduce((sum, r) => {
    const p = r.pulse_count || ((r.end_count && r.start_count) ? (r.end_count - r.start_count) : 0);
    return sum + (Number(p) || 0);
  }, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Clinic Master Session Spreadsheet</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated table of all beauty & laser treatments across all clients, synchronized locally in SQLite
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportMaster}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
            title="Export master clinic workbook to Excel (.xlsx)"
          >
            <Download className="w-4 h-4" />
            <span>Export Master Excel (.xlsx)</span>
          </button>

          <button
            onClick={fetchMasterData}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Refresh database view"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Recorded Sessions</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{filteredRows.length} Sessions</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Pulses Fired</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{totalPulses.toLocaleString()} Pulses</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Specialists Active</span>
          <p className="text-xl font-bold text-rose-600 mt-1">{staffList.length} Operators</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search client, file #, package, results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
            >
              <option value="All">All Specialists</option>
              {staffList.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredRows.length}</span> recorded sessions
        </div>
      </div>

      {/* Master Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0 border-b border-slate-300 z-10 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-300">Date</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Client Name & Code</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center">Machine</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Package</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center">S#</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center">Skin</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center">Energy</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-right">Start Count</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-right">End Count</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Specialist</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center">M/C</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-right font-bold text-emerald-800">Pulses</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Results / Reaction</th>
                <th className="py-2.5 px-3 text-center">Client File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="14" className="p-8 text-center text-slate-400">Loading master records...</td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="14" className="p-8 text-center text-slate-400">No records found matching filters.</td>
                </tr>
              ) : (
                filteredRows.map((r, idx) => {
                  const pulses = r.pulse_count || ((r.end_count && r.start_count) ? (r.end_count - r.start_count) : 0);

                  return (
                    <tr key={r.id} className={`hover:bg-rose-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700 whitespace-nowrap">
                        {r.visit_date}
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 font-sans">
                        <div className="font-bold text-slate-900">{r.full_name}</div>
                        <div className="font-mono text-[10px] text-slate-400">NO: {r.file_number} &bull; {r.phone}</div>
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-slate-800">
                        {r.machine_no || '5'}
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 font-sans font-semibold text-slate-800">
                        {r.package_name || r.service_treatment || 'FULL #1'}
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-slate-700">
                        {r.session_no || '-'}
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 text-center font-sans text-slate-700">
                        {r.skin_type || '3'}
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-rose-700">
                        {r.energy ? `${r.energy}J` : '-'}
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 text-right text-slate-600">
                        {r.start_count ? Number(r.start_count).toLocaleString() : '-'}
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 text-right text-slate-600">
                        {r.end_count ? Number(r.end_count).toLocaleString() : '-'}
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 font-sans font-bold text-slate-800">
                        {r.employee_name || r.doctor_name || '-'}
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                          {r.mc_status || 'OK'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-emerald-700">
                        {Number(pulses).toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 font-sans text-slate-600 max-w-[180px] truncate" title={r.results_notes}>
                        {r.results_notes || '-'}
                      </td>

                      <td className="py-2.5 px-3 text-center font-sans">
                        <button
                          onClick={() => onOpenPatientSheet(r.patient_id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold hover:bg-rose-100"
                          title="Open client sheet"
                        >
                          <FileSpreadsheet className="w-3 h-3 text-rose-600" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
