import React, { useState } from 'react';
import { 
  Clock, 
  UserCheck, 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  ChevronRight, 
  Trash2, 
  Phone,
  DoorOpen,
  Filter,
  Search
} from 'lucide-react';

export default function QueueView({ 
  queue, 
  onUpdateStatus, 
  onRemoveQueue, 
  onOpenPatientSheet, 
  onQuickCheckIn 
}) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate live summary stats
  const totalCheckedIn = queue.length;
  const waitingCount = queue.filter(q => q.status === 'Waiting').length;
  const inConsultCount = queue.filter(q => q.status === 'In Consultation').length;
  const completedCount = queue.filter(q => q.status === 'Completed').length;

  const filteredQueue = queue.filter(item => {
    // Status filter
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item.full_name?.toLowerCase().includes(searchLower) ||
      item.phone?.includes(searchTerm) ||
      item.file_number?.toLowerCase().includes(searchLower) ||
      String(item.queue_number).includes(searchTerm) ||
      item.doctor_assigned?.toLowerCase().includes(searchLower) ||
      item.reason_for_visit?.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Checked In</p>
            <p className="text-2xl font-bold text-slate-900">{totalCheckedIn}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Currently Waiting</p>
            <p className="text-2xl font-bold text-amber-600">{waitingCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Treatment / Room</p>
            <p className="text-2xl font-bold text-rose-600">{inConsultCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Finished Today</p>
            <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
          </div>
        </div>

      </div>

      {/* Main Queue Management Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Header, Search Bar & Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Today's Waiting Room & Queue</span>
              <span className="text-xs font-normal text-slate-500">({filteredQueue.length} clients)</span>
            </h2>
            <p className="text-xs text-slate-500">Live reception desk queue: call clients into treatment rooms and manage sessions</p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Search Bar for Waiting Room Clients */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search waiting client name, token, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1 text-xs font-medium shrink-0">
              {['All', 'Waiting', 'In Consultation', 'Completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    filterStatus === status 
                      ? 'bg-rose-600 text-white font-semibold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={onQuickCheckIn}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-xs shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>+ Check-In</span>
            </button>
          </div>
        </div>

        {/* Queue Items List */}
        {filteredQueue.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No clients in the queue matching this search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Check in a client from the top button or transition them directly from the Appointments tab.
            </p>
            <button
              onClick={onQuickCheckIn}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              <span>Check-In Client</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredQueue.map((item) => {
              const isWaiting = item.status === 'Waiting';
              const isInConsult = item.status === 'In Consultation';
              const isCompleted = item.status === 'Completed';

              return (
                <div 
                  key={item.id} 
                  className={`p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                    isInConsult ? 'bg-rose-50/40' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Left: Queue Number & Patient Details */}
                  <div className="flex items-start space-x-4">
                    {/* Queue Token Badge */}
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-center shrink-0 border ${
                      isInConsult 
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs' 
                        : isWaiting 
                        ? 'bg-amber-100 text-amber-900 border-amber-300' 
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      <span className="text-[10px] uppercase font-semibold leading-none">Token</span>
                      <span className="text-lg leading-tight">#{item.queue_number}</span>
                    </div>

                    {/* Patient Info */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">{item.full_name}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.file_number}
                        </span>
                        
                        {/* Status Tag */}
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                          isInConsult
                            ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                            : isWaiting
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Contact & Skin Type Info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.phone}</span>
                        </span>

                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>In at: {item.check_in_time}</span>
                        </span>

                        {item.skin_type && (
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium text-[10px]">
                            {item.skin_type}
                          </span>
                        )}

                        {item.allergies && item.allergies !== 'None' && item.allergies !== 'None known' && (
                          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Notice: {item.allergies}</span>
                          </span>
                        )}
                      </div>

                      {/* Specialist Assignment & Reason */}
                      <div className="text-xs font-medium text-slate-700 flex items-center space-x-3 pt-0.5">
                        <span className="text-rose-700 font-semibold">🩺 {item.doctor_assigned}</span>
                        {item.room && (
                          <span className="text-slate-500 flex items-center space-x-0.5">
                            <DoorOpen className="w-3.5 h-3.5" />
                            <span>{item.room}</span>
                          </span>
                        )}
                        <span className="text-slate-500">Package / Reason: <span className="text-slate-800 font-normal">{item.reason_for_visit}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    
                    {/* Direct Client Spreadsheet Button */}
                    <button
                      onClick={() => onOpenPatientSheet(item.patient_id)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold hover:bg-rose-100 transition-colors"
                      title="Open this client's individual beauty & laser session spreadsheet"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
                      <span>Client Sheet</span>
                    </button>

                    {/* Status Progress Button */}
                    {isWaiting && (
                      <button
                        onClick={() => onUpdateStatus(item.id, 'In Consultation')}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 active:scale-95 transition-all shadow-xs"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Call In (Room)</span>
                      </button>
                    )}

                    {isInConsult && (
                      <button
                        onClick={() => onUpdateStatus(item.id, 'Completed')}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Finished</span>
                      </button>
                    )}

                    {/* Remove from Queue */}
                    <button
                      onClick={() => onRemoveQueue(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove from queue"
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
