import React, { useState } from 'react';
import { 
  Sparkles, 
  Activity, 
  Users, 
  Calendar, 
  FileSpreadsheet, 
  HardDriveDownload, 
  Settings, 
  UserCheck, 
  PlusCircle, 
  Wifi, 
  Copy, 
  Check, 
  ShieldCheck,
  Stethoscope,
  LogOut,
  User
} from 'lucide-react';
import { getTheme } from '../theme';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  dbStatus, 
  clinicSettings,
  currentUser,
  onLogout,
  onQuickCheckIn, 
  onNewPatient,
  onOpenBackup,
  onOpenSettings,
  onOpenStaffModal
}) {
  const [copiedLan, setCopiedLan] = useState(false);
  const theme = getTheme(clinicSettings?.theme_color);

  const todayStr = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const clinicName = clinicSettings?.clinic_name || dbStatus?.clinicName || 'MEDIKA BEAUTY CLINIC';
  const subtitle = clinicSettings?.subtitle || 'Laser & Aesthetic Reception System';
  const logoUrl = clinicSettings?.logo_url || dbStatus?.logoUrl;
  const lanUrl = dbStatus?.lanUrl || (dbStatus?.localIp ? `http://${dbStatus.localIp}:3000` : 'http://localhost:3000');

  const copyLanLink = () => {
    navigator.clipboard.writeText(lanUrl);
    setCopiedLan(true);
    setTimeout(() => setCopiedLan(false), 2500);
  };

  const isBoss = currentUser?.role === 'boss';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Clinic Branding */}
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm overflow-hidden ${theme.primarySolid}`}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">{clinicName}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${theme.badge}`}>
                  Reception Desk
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
            </div>
          </div>

          {/* Center Info: Multi-Computer LAN Link & User Profile Badge */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Multi-Computer Network Share Badge */}
            <div 
              onClick={copyLanLink}
              className="cursor-pointer flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium hover:bg-blue-100 transition-colors"
              title="Click to copy LAN URL for Boss PC and other reception desks"
            >
              <Wifi className="w-3.5 h-3.5 text-blue-600" />
              <span>Multi-PC: <span className="font-mono font-semibold">{lanUrl}</span></span>
              {copiedLan ? (
                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">Copied!</span>
              ) : (
                <Copy className="w-3 h-3 text-blue-500" />
              )}
            </div>

            {/* Offline Local SQLite Badge */}
            <div 
              onClick={onOpenBackup}
              className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium hover:bg-emerald-100 transition-colors"
              title="Click to view local database details & backup options"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline SQLite ({dbStatus?.patientCount || 0} Clients)</span>
            </div>

            <div className="text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              📅 {todayStr}
            </div>
          </div>

          {/* Quick Action Buttons & Auth Profile */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onQuickCheckIn}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95 transition-all shadow-xs ${theme.primary}`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Check-In</span>
            </button>

            <button
              onClick={onNewPatient}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 active:scale-95 transition-all border border-slate-200"
            >
              <PlusCircle className={`w-3.5 h-3.5 ${theme.primaryText}`} />
              <span>New Client</span>
            </button>

            {/* Settings button (Boss only or all) */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Clinic Customization & Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile Badge & Logout */}
            <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200">
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center space-x-1 ${
                isBoss ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                <span>{isBoss ? '👑 Boss' : '👩‍⚕️ Staff'}</span>
              </span>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign out of clinic system"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto border-t border-slate-100 py-1.5">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'appointments'
                ? theme.activeTab
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Appointments</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'queue'
                ? theme.activeTab
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Waiting Room & Queue</span>
            {dbStatus?.todayQueueCount > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-xs font-bold ml-1 ${theme.badgeDark}`}>
                {dbStatus.todayQueueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'patients'
                ? theme.activeTab
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clients & Session Spreadsheets</span>
          </button>

          <button
            onClick={() => setActiveTab('master-sheet')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'master-sheet'
                ? theme.activeTab
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Master Sessions Spreadsheet</span>
          </button>

          <button
            onClick={onOpenStaffModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all ml-auto whitespace-nowrap"
            title="Manage doctors, specialists and machine staff"
          >
            <Stethoscope className="w-4 h-4 text-slate-500" />
            <span>Staff & Doctors</span>
          </button>

          <button
            onClick={onOpenBackup}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all whitespace-nowrap"
          >
            <HardDriveDownload className="w-4 h-4 text-slate-500" />
            <span>Database Backup & Restore</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
