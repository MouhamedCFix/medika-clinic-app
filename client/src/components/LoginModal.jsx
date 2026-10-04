import React, { useState } from 'react';
import { Lock, Sparkles, User, Key, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { getTheme } from '../theme';

export default function LoginModal({ clinicSettings, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const theme = getTheme(clinicSettings?.theme_color);
  const clinicName = clinicSettings?.clinic_name || 'MEDIKA BEAUTY CLINIC';
  const subtitle = clinicSettings?.subtitle || 'Laser & Aesthetic Clinic Management';
  const logoUrl = clinicSettings?.logo_url;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('medika_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-rose-500 filter blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500 filter blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-800/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-slate-950 p-6 text-center text-white border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-inner overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Sparkles className="w-8 h-8 text-rose-400" />
            )}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">{clinicName}</h1>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>

          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Clinic Access &bull; Local & VPN Protected</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="boss or reception"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-hidden transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Enter your security password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-hidden transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98 ${theme.primary}`}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Clinic System'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Login Helpers for First Run / Demonstration */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2 text-center">
              Quick Accounts for Setup:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('boss', 'boss123')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-left transition-colors"
              >
                <div className="font-bold text-slate-800 text-[11px]">👑 Boss (Admin)</div>
                <div className="text-[10px] text-slate-500">boss / boss123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('reception', 'staff123')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-left transition-colors"
              >
                <div className="font-bold text-slate-800 text-[11px]">👩‍⚕️ Staff Reception</div>
                <div className="text-[10px] text-slate-500">reception / staff123</div>
              </button>
            </div>
          </div>

        </form>

        <div className="bg-slate-50 p-3 text-center border-t border-slate-100 text-[11px] text-slate-400">
          Medika Clinic Security &bull; Offline SQLite Database &bull; Local Access Only
        </div>

      </div>
    </div>
  );
}
