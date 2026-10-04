import React, { useState } from 'react';
import { X, UserCheck, Search, Stethoscope, DoorOpen } from 'lucide-react';

export default function CheckInModal({ 
  patients, 
  doctors, 
  onClose, 
  onSuccess,
  onOpenNewPatient 
}) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]?.name || 'ELVANA');
  const [room, setRoom] = useState(doctors[0]?.room || 'Machine 5');
  const [reason, setReason] = useState('FULL #1 - Laser Session');
  const [submitting, setSubmitting] = useState(false);

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.phone?.includes(searchFilter) ||
    p.file_number?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleDoctorChange = (docName) => {
    setSelectedDoctor(docName);
    const docObj = doctors.find(d => d.name === docName);
    if (docObj?.room) setRoom(docObj.room);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Please select a client to check in');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          doctor_assigned: selectedDoctor,
          room,
          reason_for_visit: reason
        })
      });

      if (!res.ok) throw new Error('Failed to check in client');
      onSuccess();
    } catch (err) {
      alert('Error during check-in: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="bg-rose-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-rose-200" />
            <h3 className="font-bold text-sm sm:text-base">Front Desk &bull; Client Check-In</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-rose-200 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Patient Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">Select Client</label>
              <button
                type="button"
                onClick={() => { onClose(); onOpenNewPatient(); }}
                className="text-rose-600 hover:text-rose-700 font-semibold text-[11px]"
              >
                + Register New Client
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, phone or file code..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            {/* Select Dropdown / List */}
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              size="4"
              required
            >
              {filteredPatients.map(p => (
                <option key={p.id} value={p.id} className="p-1.5 border-b border-slate-100 last:border-b-0">
                  {p.file_number} - {p.full_name} ({p.phone}) {p.skin_type ? `[${p.skin_type}]` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Specialist & Room */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Specialist</label>
              <select
                value={selectedDoctor}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room / Machine</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Machine 5"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Package / Reason for Visit */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Package / Reason for Session</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. FULL #1, Face & Neck, Touchup"
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 active:scale-95 transition-all shadow-xs"
            >
              {submitting ? 'Checking In...' : 'Confirm Check-In'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
