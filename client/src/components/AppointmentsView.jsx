import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  UserCheck, 
  Trash2, 
  CheckCircle2, 
  Search, 
  Filter, 
  Sparkles,
  Phone,
  Check,
  AlertCircle,
  Edit2,
  AlertTriangle
} from 'lucide-react';
import { getTheme } from '../theme';

export default function AppointmentsView({ 
  patients, 
  doctors, 
  clinicSettings,
  onRefreshData,
  onEditAppointment
}) {
  const theme = getTheme(clinicSettings?.theme_color);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date filter: default to today (October 4, 2026)
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateFilterMode, setDateFilterMode] = useState('today');
  const [customDate, setCustomDate] = useState(todayStr);

  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [bookingConflictError, setBookingConflictError] = useState(null);

  // New Appointment Form state
  const [formData, setFormData] = useState({
    patient_id: patients[0]?.id || '',
    appointment_date: todayStr,
    appointment_time: '11:00 AM',
    doctor_name: doctors[0]?.name || 'ELVANA',
    package_name: 'FULL #1',
    reason: 'Laser Hair Removal Session'
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments');
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!formData.patient_id) {
      alert('Please select a client');
      return;
    }

    try {
      setBookingConflictError(null);
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule appointment');
      }

      setIsBooking(false);
      fetchAppointments();
      setFeedbackMsg('Appointment booked successfully!');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      setBookingConflictError(err.message);
    }
  };

  const handleDirectCheckIn = async (appointmentId, clientName) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/check-in`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check-in failed');

      setFeedbackMsg(`✓ Checked in ${clientName} directly to Waiting Room (${data.message})!`);
      fetchAppointments();
      if (onRefreshData) onRefreshData();
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      alert('Check-in error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment record?')) return;
    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      fetchAppointments();
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  // Filter logic
  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = 
      a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone?.includes(searchTerm) ||
      a.file_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (dateFilterMode === 'today') {
      matchesDate = a.appointment_date === todayStr;
    } else if (dateFilterMode === 'custom') {
      matchesDate = a.appointment_date === customDate;
    }

    return matchesSearch && matchesDate;
  });

  const todayCount = appointments.filter(a => a.appointment_date === todayStr).length;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Day Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.iconBg}`}>
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Appointments & Day Scheduling</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            View today's booked clients, prevent staff double-booking, and check them directly into the queue
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setIsBooking(!isBooking); setBookingConflictError(null); }}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold active:scale-95 transition-all shadow-xs ${theme.primary}`}
          >
            <Plus className="w-4 h-4" />
            <span>{isBooking ? 'Cancel Form' : 'Book New Appointment'}</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Booking Form Drawer with Conflict Warning */}
      {isBooking && (
        <form onSubmit={handleCreateAppointment} className={`p-5 rounded-xl border text-xs space-y-3 animate-in fade-in duration-150 ${theme.lightBg} ${theme.primaryBorder}`}>
          <h3 className="font-bold text-slate-900 text-sm">Schedule Clinic Appointment</h3>
          
          {bookingConflictError && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs font-semibold flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{bookingConflictError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Select Client *</label>
              <select
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                required
              >
                <option value="">Choose Client...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.phone}) - {p.file_number}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input 
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time</label>
              <input 
                type="text"
                placeholder="e.g. 10:30 AM"
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Specialist / Staff</label>
              <select
                value={formData.doctor_name}
                onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Package / Service</label>
              <input 
                type="text"
                placeholder="e.g. FULL #1, Face & Neck, Half Legs"
                value={formData.package_name}
                onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason / Notes</label>
              <input 
                type="text"
                placeholder="e.g. Session #5, Touchup, Consultation"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-semibold shadow-xs active:scale-95 transition-all ${theme.primary}`}
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      )}

      {/* Search Bar & Day Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Search Input for Appointments */}
        <div className="relative flex-1 sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search appointment client, phone, specialist, package..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
          />
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center space-x-1.5 text-xs font-medium">
          <button
            onClick={() => setDateFilterMode('today')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateFilterMode === 'today'
                ? `${theme.primarySolid} text-white font-bold shadow-2xs`
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Today's ({todayCount})
          </button>

          <button
            onClick={() => setDateFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateFilterMode === 'all'
                ? `${theme.primarySolid} text-white font-bold shadow-2xs`
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Dates ({appointments.length})
          </button>

          <div className="flex items-center space-x-1 pl-1">
            <input 
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilterMode('custom');
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading appointments...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No appointments found for this filter</p>
            <p className="text-xs text-slate-500 mt-1">
              {dateFilterMode === 'today' ? "No appointments scheduled for today yet." : "No records matching your search."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAppointments.map(a => {
              const isCheckedIn = a.status === 'Checked In';
              const isToday = a.appointment_date === todayStr;

              return (
                <div 
                  key={a.id} 
                  className={`p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                    isCheckedIn ? 'bg-emerald-50/40' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Date Badge */}
                    <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-center shrink-0 border ${
                      isToday 
                        ? `${theme.lightBg} ${theme.primaryBorder} ${theme.primaryText}` 
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      <span className="text-[10px] uppercase font-semibold leading-none">
                        {new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-xl leading-tight">
                        {new Date(a.appointment_date).getUTCDate()}
                      </span>
                      {isToday && <span className={`text-[9px] uppercase font-bold ${theme.primaryText}`}>Today</span>}
                    </div>

                    {/* Patient & Appointment Details */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{a.full_name}</span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {a.file_number}
                        </span>
                        
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                          isCheckedIn
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {a.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="flex items-center space-x-1 font-semibold text-slate-700">
                          <Clock className={`w-3.5 h-3.5 ${theme.primaryText}`} />
                          <span>{a.appointment_time}</span>
                        </span>
                        
                        <span className={`font-semibold ${theme.primaryText}`}>🩺 {a.doctor_name}</span>
                        
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{a.phone}</span>
                        </span>

                        {a.skin_type && (
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                            {a.skin_type}
                          </span>
                        )}
                      </div>

                      <div className="text-xs mt-1">
                        {a.package_name && (
                          <span className={`font-bold px-2 py-0.5 rounded mr-2 border ${theme.lightBg} ${theme.primaryBorder} text-slate-800`}>
                            {a.package_name}
                          </span>
                        )}
                        <span className="text-slate-600">{a.reason}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit, Direct Check-In, and Delete */}
                  <div className="flex items-center space-x-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    
                    {/* Modify Appointment Button */}
                    <button
                      onClick={() => onEditAppointment(a)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      title="Edit appointment time, specialist, or details"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit</span>
                    </button>

                    {!isCheckedIn && (
                      <button
                        onClick={() => handleDirectCheckIn(a.id, a.full_name)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95 transition-all shadow-xs ${theme.primary}`}
                        title="Transfer client directly from appointment into today's waiting room queue"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Check-In to Queue</span>
                      </button>
                    )}

                    {isCheckedIn && (
                      <span className="flex items-center space-x-1 text-xs text-emerald-700 font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>In Queue</span>
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
