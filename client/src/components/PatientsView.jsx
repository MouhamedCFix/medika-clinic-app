import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  FileSpreadsheet, 
  UserCheck, 
  Phone, 
  Calendar, 
  Droplet, 
  AlertTriangle, 
  Trash2, 
  Edit3,
  Upload,
  ArrowUpDown
} from 'lucide-react';

export default function PatientsView({ 
  patients, 
  onSearch, 
  onSelectPatientSheet, 
  onCheckInPatient, 
  onNewPatient, 
  onEditPatient,
  onDeletePatient 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    onSearch(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Search Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Clients Directory & Session Spreadsheets</h2>
          <p className="text-xs text-slate-500">Every client has their own laser and aesthetic session spreadsheet stored locally</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search name, phone, or file number..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={onNewPatient}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 active:scale-95 transition-all shadow-xs shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Client</span>
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">File #</th>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Skin Type</th>
                <th className="py-3 px-4">Medical Notice</th>
                <th className="py-3 px-4 text-center">Sessions in Sheet</th>
                <th className="py-3 px-4 text-center">Client Spreadsheet</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    No clients match your search criteria.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {p.file_number}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.full_name}</div>
                      <div className="text-[11px] text-slate-400">{p.gender} &bull; {p.dob || 'DOB N/A'}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.phone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-[11px]">
                        {p.skin_type || 'Type 3'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {p.allergies && p.allergies !== 'None' && p.allergies !== 'None reported' ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-[10px] flex items-center space-x-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>{p.allergies}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Clear</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {p.total_visits || 0} sessions
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectPatientSheet(p.id)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold hover:bg-rose-100 active:scale-95 transition-all shadow-2xs"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
                        <span>Open Client Sheet</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onCheckInPatient(p.id)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-2xs"
                          title="Check in to today's queue"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Check-In</span>
                        </button>

                        <button
                          onClick={() => onEditPatient(p)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Modify Client Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeletePatient(p.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Client Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
