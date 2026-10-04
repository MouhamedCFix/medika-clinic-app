import React, { useState } from 'react';
import { X, UserPlus, Heart, Phone, Sparkles } from 'lucide-react';

export default function NewPatientModal({ 
  onClose, 
  onSuccess, 
  onOpenPatientSheet 
}) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    file_number: '',
    dob: '',
    gender: 'Female',
    skin_type: 'Type 3',
    allergies: '',
    emergency_contact: '',
    notes: 'Laser Hair Removal - FULL #1',
    checkInNow: true,
    openSheetNow: false
  });
  const [submitting, setSubmitting] = useState(false);

  const handlePhoneChange = (val) => {
    setFormData(prev => ({
      ...prev,
      phone: val,
      file_number: prev.file_number ? prev.file_number : val.replace(/[^0-9]/g, '')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) {
      alert('Full Name and Phone Number are required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to register client');
      const createdPatient = await res.json();

      if (formData.checkInNow) {
        await fetch('/api/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: createdPatient.id,
            doctor_assigned: 'ELVANA',
            room: 'Machine 5',
            reason_for_visit: formData.notes || 'Laser Session Check-In'
          })
        });
      }

      onSuccess();
      if (formData.openSheetNow) {
        onOpenPatientSheet(createdPatient.id);
      }
    } catch (err) {
      alert('Error creating client: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden my-auto animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Register New Client File</h3>
              <p className="text-[11px] text-slate-400">Creates client profile and automatic laser session spreadsheet</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input 
                type="text" 
                placeholder="e.g. KALTHOUM ABO MJER"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input 
                type="tel" 
                placeholder="e.g. 78992784"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">File # (Auto or Custom)</label>
              <input 
                type="text" 
                placeholder="e.g. 78992784"
                value={formData.file_number}
                onChange={(e) => setFormData({ ...formData, file_number: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Skin Type (Fitzpatrick)</label>
              <select
                value={formData.skin_type}
                onChange={(e) => setFormData({ ...formData, skin_type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
              >
                <option value="Type 1">Type 1 (Very Fair)</option>
                <option value="Type 2">Type 2 (Fair / Light)</option>
                <option value="Type 3">Type 3 (Medium / Olive)</option>
                <option value="Type 4">Type 4 (Olive / Brown)</option>
                <option value="Type 5">Type 5 (Brown / Dark)</option>
                <option value="Type 6">Type 6 (Deep / Dark)</option>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Medical Notice / Allergies</label>
              <input 
                type="text" 
                placeholder="e.g. None, Sensitive skin, Keloids"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Family / Emergency Contact</label>
              <input 
                type="text" 
                placeholder="e.g. 78/992784"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Package & Clinical Intake Notes</label>
            <textarea
              rows="2"
              placeholder="e.g. Laser Hair Removal - FULL #1 package"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
            ></textarea>
          </div>

          {/* Quick Reception Checkbox Options */}
          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.checkInNow}
                onChange={(e) => setFormData({ ...formData, checkInNow: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <span className="font-semibold text-slate-800 text-xs">
                Immediately add client to Today's Waiting Room Queue
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.openSheetNow}
                onChange={(e) => setFormData({ ...formData, openSheetNow: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <span className="font-semibold text-slate-800 text-xs">
                Open Client Session Spreadsheet immediately after saving
              </span>
            </label>
          </div>

          {/* Footer actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
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
              {submitting ? 'Registering...' : 'Save Client File'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
