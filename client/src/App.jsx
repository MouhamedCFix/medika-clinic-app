import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import QueueView from './components/QueueView';
import PatientsView from './components/PatientsView';
import MasterSpreadsheetView from './components/MasterSpreadsheetView';
import AppointmentsView from './components/AppointmentsView';
import PatientSheetModal from './components/PatientSheetModal';
import CheckInModal from './components/CheckInModal';
import NewPatientModal from './components/NewPatientModal';
import EditPatientModal from './components/EditPatientModal';
import EditAppointmentModal from './components/EditAppointmentModal';
import StaffModal from './components/StaffModal';
import ClinicSettingsModal from './components/ClinicSettingsModal';
import BackupModal from './components/BackupModal';
import LoginModal from './components/LoginModal';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medika_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('appointments');
  
  // Data states
  const [dbStatus, setDbStatus] = useState(null);
  const [clinicSettings, setClinicSettings] = useState(null);
  const [queue, setQueue] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  // Modal states
  const [selectedPatientSheetId, setSelectedPatientSheetId] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Fetch all clinic data
  const loadData = async () => {
    try {
      const [resStatus, resSettings, resQueue, resPatients, resDoctors] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/settings'),
        fetch('/api/queue'),
        fetch('/api/patients'),
        fetch('/api/doctors')
      ]);

      if (resStatus.ok) setDbStatus(await resStatus.json());
      if (resSettings.ok) setClinicSettings(await resSettings.json());
      if (resQueue.ok) setQueue(await resQueue.json());
      if (resPatients.ok) setPatients(await resPatients.json());
      if (resDoctors.ok) setDoctors(await resDoctors.json());
    } catch (err) {
      console.error('Failed to load clinic data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('medika_user');
    setCurrentUser(null);
  };

  // Update Queue status
  const handleUpdateQueueStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/queue/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      loadData();
    } catch (err) {
      alert('Error updating queue status: ' + err.message);
    }
  };

  const handleRemoveQueue = async (id) => {
    if (!window.confirm("Remove client from today's waiting queue?")) return;
    try {
      const res = await fetch(`/api/queue/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove from queue');
      loadData();
    } catch (err) {
      alert('Error removing from queue: ' + err.message);
    }
  };

  const handleSearchPatients = async (term) => {
    try {
      const res = await fetch(`/api/patients?search=${encodeURIComponent(term)}`);
      if (res.ok) {
        setPatients(await res.json());
      }
    } catch (err) {
      console.error('Error searching patients:', err);
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Are you sure? This will delete the client and their entire session history spreadsheet from the local database.')) return;
    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete client');
      loadData();
    } catch (err) {
      alert('Error deleting client: ' + err.message);
    }
  };

  const handleSaveSettings = async (newSettings) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    if (!res.ok) throw new Error('Failed to save settings');
    loadData();
  };

  // If user is not logged in, render the Security Login Screen
  if (!currentUser) {
    return (
      <LoginModal 
        clinicSettings={clinicSettings}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbStatus={dbStatus}
        clinicSettings={clinicSettings}
        currentUser={currentUser}
        onLogout={handleLogout}
        onQuickCheckIn={() => setShowCheckInModal(true)}
        onNewPatient={() => setShowNewPatientModal(true)}
        onOpenBackup={() => setShowBackupModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenStaffModal={() => setShowStaffModal(true)}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'appointments' && (
          <AppointmentsView
            patients={patients}
            doctors={doctors}
            clinicSettings={clinicSettings}
            onRefreshData={loadData}
            onEditAppointment={(appt) => setEditingAppointment(appt)}
          />
        )}

        {activeTab === 'queue' && (
          <QueueView
            queue={queue}
            onUpdateStatus={handleUpdateQueueStatus}
            onRemoveQueue={handleRemoveQueue}
            onOpenPatientSheet={(id) => setSelectedPatientSheetId(id)}
            onQuickCheckIn={() => setShowCheckInModal(true)}
          />
        )}

        {activeTab === 'patients' && (
          <PatientsView
            patients={patients}
            onSearch={handleSearchPatients}
            onSelectPatientSheet={(id) => setSelectedPatientSheetId(id)}
            onCheckInPatient={(id) => setShowCheckInModal(true)}
            onNewPatient={() => setShowNewPatientModal(true)}
            onEditPatient={(patient) => setEditingPatient(patient)}
            onDeletePatient={handleDeletePatient}
          />
        )}

        {activeTab === 'master-sheet' && (
          <MasterSpreadsheetView
            onOpenPatientSheet={(id) => setSelectedPatientSheetId(id)}
          />
        )}

      </main>

      {/* Client-Specific Spreadsheet Modal */}
      {selectedPatientSheetId && (
        <PatientSheetModal
          patientId={selectedPatientSheetId}
          doctors={doctors}
          onClose={() => {
            setSelectedPatientSheetId(null);
            loadData();
          }}
        />
      )}

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          patients={patients}
          doctors={doctors}
          clinicSettings={clinicSettings}
          onClose={() => setEditingAppointment(null)}
          onSuccess={() => {
            setEditingAppointment(null);
            loadData();
          }}
        />
      )}

      {/* Check-In Modal */}
      {showCheckInModal && (
        <CheckInModal
          patients={patients}
          doctors={doctors}
          onClose={() => setShowCheckInModal(false)}
          onSuccess={() => {
            setShowCheckInModal(false);
            loadData();
            setActiveTab('queue');
          }}
          onOpenNewPatient={() => setShowNewPatientModal(true)}
        />
      )}

      {/* New Patient Registration Modal */}
      {showNewPatientModal && (
        <NewPatientModal
          onClose={() => setShowNewPatientModal(false)}
          onSuccess={() => {
            setShowNewPatientModal(false);
            loadData();
          }}
          onOpenPatientSheet={(id) => {
            setSelectedPatientSheetId(id);
          }}
        />
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <EditPatientModal
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSuccess={() => {
            setEditingPatient(null);
            loadData();
          }}
        />
      )}

      {/* Staff & Specialists Modal */}
      {showStaffModal && (
        <StaffModal
          doctors={doctors}
          onClose={() => setShowStaffModal(false)}
          onRefresh={loadData}
        />
      )}

      {/* Clinic Settings & Customization Modal */}
      {showSettingsModal && (
        <ClinicSettingsModal
          settings={clinicSettings}
          dbStatus={dbStatus}
          currentUser={currentUser}
          onClose={() => setShowSettingsModal(false)}
          onSaveSettings={handleSaveSettings}
          onOpenStaffModal={() => setShowStaffModal(true)}
          onRefreshData={loadData}
        />
      )}

      {/* Local Database & Backup / Recovery Modal */}
      {showBackupModal && (
        <BackupModal
          dbStatus={dbStatus}
          clinicSettings={clinicSettings}
          onClose={() => setShowBackupModal(false)}
          onRefreshData={loadData}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-400">
        {clinicSettings?.clinic_name || 'MEDIKA BEAUTY CLINIC'} &bull; Local SQLite &bull; Multi-Computer LAN Ready ({dbStatus?.lanUrl || 'localhost:3000'})
      </footer>

    </div>
  );
}
