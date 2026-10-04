import React, { useState, useRef } from 'react';
import { 
  X, 
  Settings, 
  Palette, 
  Wifi, 
  Copy, 
  Check, 
  Building2, 
  Stethoscope, 
  Save, 
  ShieldCheck, 
  Monitor,
  Laptop,
  Image,
  Upload,
  Trash2,
  Key
} from 'lucide-react';
import { THEMES, getTheme } from '../theme';

export default function ClinicSettingsModal({ 
  settings, 
  dbStatus, 
  currentUser,
  onClose, 
  onSaveSettings,
  onOpenStaffModal,
  onRefreshData 
}) {
  const [formData, setFormData] = useState({
    clinic_name: settings?.clinic_name || 'MEDIKA BEAUTY CLINIC',
    subtitle: settings?.subtitle || 'Laser, Aesthetic & Skin Care Center',
    theme_color: settings?.theme_color || 'rose',
    phone: settings?.phone || '+1 (555) 789-9278',
    address: settings?.address || 'Suite 200, Medical Plaza',
    currency_symbol: settings?.currency_symbol || '$'
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(settings?.logo_url || null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [copiedLan, setCopiedLan] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '' });
  const [passwordMsg, setPasswordMsg] = useState(null);

  const lanUrl = settings?.lanUrl || (dbStatus?.localIp ? `http://${dbStatus.localIp}:3000` : 'http://localhost:3000');
  const currentTheme = getTheme(formData.theme_color);

  const copyLan = () => {
    navigator.clipboard.writeText(lanUrl);
    setCopiedLan(true);
    setTimeout(() => setCopiedLan(false), 2500);
  };

  // Handle Logo Upload
  const handleLogoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('logoFile', file);

    try {
      setLogoUploading(true);
      const res = await fetch('/api/settings/logo', {
        method: 'POST',
        body: data
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to upload logo');

      setLogoPreview(resData.logoUrl);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Logo upload failed: ' + err.message);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm('Reset clinic logo to default?')) return;
    try {
      await fetch('/api/settings/logo', { method: 'DELETE' });
      setLogoPreview(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Error removing logo');
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser?.username || 'boss',
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPasswordMsg('Password changed successfully!');
      setPasswordForm({ old_password: '', new_password: '' });
      setTimeout(() => setPasswordMsg(null), 3000);
    } catch (err) {
      alert('Password error: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onSaveSettings(formData);
      onClose();
    } catch (err) {
      alert('Error saving settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentTheme.primarySolid} text-white`}>
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Clinic Customization & Security</h3>
              <p className="text-xs text-slate-400">Customize clinic branding, logo, theme colors, and VPN / LAN access</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          {/* Multi-Computer Network Setup Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs sm:text-sm">
                <Wifi className="w-4 h-4 text-blue-600" />
                <span>Multi-Computer & VPN Access (Boss PC & Reception)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold text-[10px]">
                LOCAL WI-FI / VPN
              </span>
            </div>

            <p className="text-blue-900/80 text-[11px] leading-relaxed">
              Any computer connected to the clinic's Wi-Fi, LAN, or VPN can open this exact link in Google Chrome to access the system:
            </p>

            <div className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-blue-200">
              <span className="text-slate-500 text-[11px] font-semibold">Clinic URL:</span>
              <span className="font-mono font-bold text-blue-700 text-xs sm:text-sm flex-1">{lanUrl}</span>
              <button
                type="button"
                onClick={copyLan}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
              >
                {copiedLan ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLan ? 'Copied Link!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Clinic Logo Upload Section */}
          <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs block">Clinic Logo</span>
                <span className="text-[11px] text-slate-500">Upload your clinic's official brand logo image</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={logoUploading}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 text-xs shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-rose-600" />
                  <span>{logoUploading ? 'Uploading...' : 'Upload Logo'}</span>
                </button>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Remove custom logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Logo Preview */}
            {logoPreview && (
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-14 h-14 rounded-xl border border-slate-300 bg-white p-1 overflow-hidden flex items-center justify-center">
                  <img src={logoPreview} alt="Clinic Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold">✓ Custom logo active on top navigation bar</span>
              </div>
            )}
          </div>

          {/* Clinic Branding */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Building2 className={`w-3.5 h-3.5 ${currentTheme.primaryText}`} />
              <span>Clinic Name & Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={formData.clinic_name}
                  onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                  placeholder="e.g. MEDIKA BEAUTY CLINIC"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinic Subtitle / Tagline</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Laser, Aesthetic & Skin Care Center"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Theme Color Selector */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Palette className={`w-3.5 h-3.5 ${currentTheme.primaryText}`} />
              <span>Theme Color Customization</span>
            </h4>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.values(THEMES).map((th) => {
                const isSelected = formData.theme_color === th.id;
                return (
                  <button
                    type="button"
                    key={th.id}
                    onClick={() => setFormData({ ...formData, theme_color: th.id })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center space-y-1.5 transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-100 shadow-xs ring-2 ring-slate-900/20 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full shadow-inner flex items-center justify-center text-white"
                      style={{ backgroundColor: th.colorHex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-[10px] text-slate-700">{th.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Password Security Section */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs block">Account Security & Password</span>
                <span className="text-[11px] text-slate-500">Change login password for {currentUser?.displayName || 'User'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 text-xs"
              >
                {showPasswordChange ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordChange && (
              <div className="pt-2 space-y-2 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwordForm.old_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                    className="p-1.5 bg-white border border-slate-300 rounded text-xs"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="p-1.5 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
                {passwordMsg && <span className="text-[11px] text-emerald-600 font-bold">{passwordMsg}</span>}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="px-3 py-1 rounded bg-slate-900 text-white font-semibold text-xs"
                  >
                    Save New Password
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Staff Button */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 text-xs block">Staff & Specialists Roster</span>
              <span className="text-[11px] text-slate-500">Modify laser specialists, machine operators, and doctors</span>
            </div>
            <button
              type="button"
              onClick={() => { onClose(); onOpenStaffModal(); }}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 text-xs flex items-center space-x-1 shadow-2xs"
            >
              <Stethoscope className={`w-3.5 h-3.5 ${currentTheme.primaryText}`} />
              <span>Manage Roster</span>
            </button>
          </div>

          {/* Submit */}
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
              disabled={saving}
              className={`px-4 py-2 rounded-lg font-semibold shadow-xs flex items-center space-x-1 active:scale-95 transition-all ${currentTheme.primary}`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Apply & Save Settings'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
