import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, Stethoscope, Sparkles } from 'lucide-react';

export default function StaffModal({ doctors, onClose, onRefresh }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    specialty: 'Laser Specialist',
    room: 'Machine 5',
    phone: ''
  });

  const handleStartEdit = (doc) => {
    setEditingId(doc.id);
    setEditForm({ ...doc });
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Failed to update specialist');
      setEditingId(null);
      onRefresh();
    } catch (err) {
      alert('Error updating staff: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member / specialist?')) return;
    try {
      const res = await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete staff member');
      onRefresh();
    } catch (err) {
      alert('Error deleting staff: ' + err.message);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name) {
      alert('Name is required');
      return;
    }

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });
      if (!res.ok) throw new Error('Failed to add specialist');
      setIsAdding(false);
      setNewStaff({
        name: '',
        specialty: 'Laser Specialist',
        room: 'Machine 5',
        phone: ''
      });
      onRefresh();
    } catch (err) {
      alert('Error adding staff: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden my-auto animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Staff, Specialists & Doctors</h3>
              <p className="text-[11px] text-slate-400">Modify employees, machine operators, and doctor rosters</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Active Roster ({doctors.length})
            </span>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? 'Cancel' : 'Add Staff Member'}</span>
            </button>
          </div>

          {/* Add Staff Form */}
          {isAdding && (
            <form onSubmit={handleAddStaff} className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2.5 animate-in fade-in duration-150">
              <div className="font-bold text-rose-950 text-xs">Add New Staff / Specialist</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. ELVANA, Dr. Smith"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Role / Specialty</label>
                  <input
                    type="text"
                    placeholder="e.g. Laser Specialist, Nurse"
                    value={newStaff.specialty}
                    onChange={(e) => setNewStaff({ ...newStaff, specialty: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Room / Machine</label>
                  <input
                    type="text"
                    placeholder="e.g. Machine 5, Room 101"
                    value={newStaff.room}
                    onChange={(e) => setNewStaff({ ...newStaff, room: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 555-0101"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-2xs"
                >
                  Save Specialist
                </button>
              </div>
            </form>
          )}

          {/* Staff Roster List */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-80 overflow-y-auto">
            {doctors.map(doc => {
              const isEditing = editingId === doc.id;

              if (isEditing) {
                return (
                  <div key={doc.id} className="p-3 bg-amber-50/70 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-white border border-slate-300 rounded p-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={editForm.specialty}
                        onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                        className="bg-white border border-slate-300 rounded p-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={editForm.room}
                        onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                        className="bg-white border border-slate-300 rounded p-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="bg-white border border-slate-300 rounded p-1.5 text-xs"
                      />
                    </div>
                    <div className="flex justify-end space-x-1.5">
                      <button
                        onClick={() => handleSaveEdit(doc.id)}
                        className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold text-xs flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 font-semibold text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={doc.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{doc.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                      <span className="text-rose-700 font-medium">{doc.specialty}</span>
                      <span>&bull;</span>
                      <span>{doc.room || 'General'}</span>
                      {doc.phone && (
                        <>
                          <span>&bull;</span>
                          <span>{doc.phone}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleStartEdit(doc)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Edit Specialist"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Specialist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
