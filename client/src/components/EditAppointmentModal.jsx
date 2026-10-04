import React, { useState } from 'react';
import { X, Calendar, Clock, User, Stethoscope, AlertTriangle, Check, Edit2 } from 'lucide-react';
import { getTheme } from '../theme';

export default function EditAppointmentModal({ 
  appointment, 
  patients, 
  doctors, 
  clinicSettings, 
  onClose, 
  onSuccess 
}) {
  const theme = getTheme(clinicSettings?.theme_color);

  const [formData, setFormData] = useState({
    patient_id: appointment.patient_id,
    appointment_date: appointment.appointment_date,
    appointment_time: appointment.appointment_time,
    doctor_name: appointment.doctor_name || 'ELVANA',
    package_name: appointment.package_name || 'FULL #1',
    reason: appointment.reason || '',
    status: appointment.status || 'Scheduled'
  });

  const [conflictError, setConflictError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setConflictError(null);

      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update appointment');
      }

      onSuccess();
    } catch (err) {
      setConflictError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Edit2 className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-sm sm:text-base">Modify Appointment Details</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {conflictError && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs font-semibold flex items-start space-x-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{conflictError}</span>
            </div>
          )}

          {/* Client Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client</label>
            <select
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              required
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.full_name} ({p.phone}) - {p.file_number}</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Appointment Date</label>
              <input
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Appointment Time</label>
              <input
                type="text"
                placeholder="e.g. 10:30 AM"
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Specialist & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Specialist</label>
              <select
                value={formData.doctor_name}
                onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Appointment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Checked In">Checked In</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Package & Reason */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Package / Service</label>
              <input
                type="text"
                placeholder="e.g. FULL #1, Face & Neck"
                value={formData.package_name}
                onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason / Notes</label>
              <input
                type="text"
                placeholder="e.g. Session #5, Touchup"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-lg font-semibold shadow-xs active:scale-95 transition-all ${theme.primary}`}
            >
              {submitting ? 'Saving...' : 'Update Appointment'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
