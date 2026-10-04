import React, { useState, useRef } from 'react';
import { 
  X, 
  Database, 
  HardDriveDownload, 
  FileSpreadsheet, 
  ShieldCheck, 
  Lock, 
  Upload, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { getTheme } from '../theme';

export default function BackupModal({ dbStatus, clinicSettings, onClose, onRefreshData }) {
  const theme = getTheme(clinicSettings?.theme_color);
  const fileInputRef = useRef(null);

  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState(null);
  const [restoreError, setRestoreError] = useState(null);

  const handleDownloadDb = () => {
    window.location.href = '/api/backup/download-db';
  };

  const handleDownloadExcel = () => {
    window.location.href = '/api/export-master-excel';
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Restore Database from Uploaded .db File
  const handleRestoreFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm(`Are you sure you want to restore the database from "${file.name}"? Current data will be replaced with this backup.`)) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('backupFile', file);

    try {
      setRestoring(true);
      setRestoreError(null);
      setRestoreMessage('Restoring SQLite database file...');

      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to restore database');
      }

      setRestoreMessage(`✓ ${data.message}`);
      if (onRefreshData) onRefreshData();
      setTimeout(() => setRestoreMessage(null), 5000);
    } catch (err) {
      setRestoreError(err.message);
    } finally {
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.primarySolid} text-white`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Database Backup & Recovery</h3>
              <p className="text-xs text-slate-400">Download daily copies and easily restore your clinic database anytime</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          
          {/* Live Storage Metrics Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Active Database: SQLite 3 Engine (Local File)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                OFFLINE &bull; 100% PRIVATE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Total Clients</span>
                <span className="text-lg font-bold text-slate-900">{dbStatus?.patientCount || 0}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Session Rows</span>
                <span className="text-lg font-bold text-slate-900">{dbStatus?.sheetRowCount || 0}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">File Size</span>
                <span className="text-lg font-bold text-slate-900">{formatBytes(dbStatus?.fileSizeBytes)}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Today's Queue</span>
                <span className="text-lg font-bold text-slate-900">{dbStatus?.todayQueueCount || 0}</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500 font-mono bg-white p-2 rounded border border-slate-200 break-all">
              <span className="text-slate-400 font-sans">Physical Path on Computer: </span>
              {dbStatus?.databasePath || 'data\\clinic.db'}
            </div>
          </div>

          {/* SECTION 1: DOWNLOAD BACKUP */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
              <HardDriveDownload className={`w-4 h-4 ${theme.primaryText}`} />
              <span>1. Download Daily Backup</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadDb}
                className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-xs"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Download Database File (.db)</span>
              </button>

              <button
                onClick={handleDownloadExcel}
                className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Master Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: HOW TO RECOVER / RESTORE BACKUP */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
            <h4 className="font-bold text-amber-950 flex items-center space-x-1.5 text-xs">
              <RefreshCw className="w-4 h-4 text-amber-700" />
              <span>2. How to Recover & Restore Your Backup</span>
            </h4>

            {restoreMessage && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{restoreMessage}</span>
              </div>
            )}

            {restoreError && (
              <div className="p-3 bg-rose-100 border border-rose-300 rounded-lg text-rose-900 font-bold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{restoreError}</span>
              </div>
            )}

            <p className="text-amber-900 text-[11px] leading-relaxed">
              If you ever need to restore your clinic data (e.g. recovering from an old backup, moving to a new computer, or fixing a mistake), you have <strong>two easy ways</strong>:
            </p>

            <div className="space-y-2 text-[11px] text-amber-950">
              <div className="bg-white p-2.5 rounded-lg border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold block">Method A: 1-Click Upload Restore (Easiest)</span>
                  <span className="text-slate-600">Select your saved <code>clinic_backup.db</code> file from your USB flash drive.</span>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleRestoreFile}
                    accept=".db,.sqlite,.sqlite3"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={restoring}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 shadow-2xs flex items-center space-x-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{restoring ? 'Restoring...' : 'Upload & Restore .db'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="font-bold block text-slate-800">Method B: Manual File Copy (If PC was replaced)</span>
                <span className="text-slate-600 block mt-0.5">
                  Simply copy your backup file, rename it to <strong><code>clinic.db</code></strong>, and paste it inside the <strong><code>data\</code></strong> folder in your app directory. When you run <code>start-medika.bat</code>, all your data will be there immediately!
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
