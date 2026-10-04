import React, { useState } from 'react';
import { X, UserCheck, Edit3 } from 'lucide-react';

export default function EditPatientModal({ patient, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: patient.full_name || '',
    phone: patient.phone || '',
    file_number: patient.file_number || '',
    dob: patient.dob || '',
    gender: patient.gender || 'Female',
    skin_type: patient.skin_type || 'Type 3',
    allergies: patient.allergies || '',
    emergency_contact: patient.emergency_contact || '',
    notes: patient.notes || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) {
      alert('Name and Phone are required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to update patient');
      onSuccess();
    } catch (err) {
      alert('Error: ' + err.message);
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
            <Edit3 className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-sm sm:text-base">Modify Client Details</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input 
                type="text" 
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">File # / Code</label>
              <input 
                type="text" 
                value={formData.file_number}
                onChange={(e) => setFormData({ ...formData, file_number: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Skin Type</label>
              <select
                value={formData.skin_type}
                onChange={(e) => setFormData({ ...formData, skin_type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
              >
                <option value="Type 1">Type 1</option>
                <option value="Type 2">Type 2</option>
                <option value="Type 3">Type 3</option>
                <option value="Type 4">Type 4</option>
                <option value="Type 5">Type 5</option>
                <option value="Type 6">Type 6</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notice / Allergies</label>
              <input 
                type="text" 
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency / Family Contact</label>
              <input 
                type="text" 
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">General Notes</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
            ></textarea>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
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
              className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-2xs"
            >
              {submitting ? 'Saving...' : 'Update Client'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
