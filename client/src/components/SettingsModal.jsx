import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Moon, Sun, LogOut, Key, Activity, Clock, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeClasses } from '../hooks/useThemeClasses';

export default function SettingsModal({ isOpen, onClose, onLogout }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const t = useThemeClasses();
  const [activeTab, setActiveTab] = useState('account'); // account, activity, logins

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

  if (!isOpen) return null;

  const dummyLogins = [];
  const dummyActivity = [];

  const handleUpdatePassword = () => {
    const storedPassword = localStorage.getItem('adminPassword') || 'admin123';
    if (currentPassword !== storedPassword) {
      setPasswordMessage({ text: 'Current password is incorrect.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 5) {
      setPasswordMessage({ text: 'Password must be at least 5 characters.', type: 'error' });
      return;
    }
    
    localStorage.setItem('adminPassword', newPassword);
    setPasswordMessage({ text: 'Password successfully updated!', type: 'success' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => {
      setPasswordMessage({ text: '', type: '' });
    }, 3000);
  };

  const modalContent = (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px] ${t.isDark ? "bg-slate-900" : "bg-white"}`}>
        
        {/* Settings Sidebar */}
        <div className={`w-full md:w-64 p-6 border-b md:border-b-0 md:border-r flex flex-col ${t.isDark ? "bg-slate-800/50 border-white/10" : "bg-slate-50 border-slate-200"}`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className={`text-xl font-black flex items-center gap-2 ${t.isDark ? "text-white" : "text-slate-900"}`}>
              <Shield className="text-accent" size={24} />
              Settings
            </h2>
            <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <button onClick={() => setActiveTab('account')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'account' ? "bg-accent text-white shadow-md shadow-accent/20" : t.isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-black/5 hover:text-slate-900"}`}>
              <Key size={18} /> Account & Security
            </button>
            <button onClick={() => setActiveTab('activity')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'activity' ? "bg-accent text-white shadow-md shadow-accent/20" : t.isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-black/5 hover:text-slate-900"}`}>
              <Activity size={18} /> Activity Log
            </button>
            <button onClick={() => setActiveTab('logins')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'logins' ? "bg-accent text-white shadow-md shadow-accent/20" : t.isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-black/5 hover:text-slate-900"}`}>
              <Clock size={18} /> Login History
            </button>
          </div>

          {/* Preferences and Logout */}
          <div className="mt-8 flex flex-col gap-2 pt-6 border-t border-inherit">
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${t.isDark ? "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm border border-slate-200"}`}
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                Theme
              </div>
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md ${t.isDark ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"}`}>
                {isDarkMode ? "DARK" : "LIGHT"}
              </span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white mt-2"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 relative overflow-y-auto custom-scrollbar">
          <button onClick={onClose} className="hidden md:block absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
            <X size={24} />
          </button>

          {activeTab === 'account' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h3 className={`text-2xl font-black mb-1 ${t.isDark ? "text-white" : "text-slate-900"}`}>Account & Security</h3>
              <p className="text-muted text-sm font-medium mb-8">Manage your credentials and software preferences.</p>
              
              <div className="max-w-md space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-accent transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-accent transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-accent transition-all" />
                </div>
                
                {passwordMessage.text && (
                  <div className={`p-3 rounded-lg text-xs font-bold ${passwordMessage.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {passwordMessage.text}
                  </div>
                )}
                
                <button onClick={handleUpdatePassword} className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest shadow-md transition-all mt-4">
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h3 className={`text-2xl font-black mb-1 ${t.isDark ? "text-white" : "text-slate-900"}`}>Recent Activity</h3>
              <p className="text-muted text-sm font-medium mb-8">Audit trail of actions performed within the ERP.</p>
              
              <div className="space-y-4">
                {dummyActivity.length > 0 ? dummyActivity.map(act => (
                  <div key={act.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${t.isDark ? "border-white/5 bg-white/5" : "border-slate-100 bg-white shadow-sm"}`}>
                    <div className={`p-3 rounded-xl ${t.isDark ? "bg-black/20" : "bg-slate-50"}`}>
                      {act.icon}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${t.isDark ? "text-white" : "text-slate-900"}`}>{act.action}</h4>
                      <p className="text-xs text-muted font-medium mt-0.5">{act.time}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-2xl">
                    <p className="text-muted text-sm font-bold">No recent activity recorded.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'logins' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h3 className={`text-2xl font-black mb-1 ${t.isDark ? "text-white" : "text-slate-900"}`}>Login History</h3>
              <p className="text-muted text-sm font-medium mb-8">Track access locations and status.</p>
              
              <div className="overflow-hidden rounded-2xl border border-[var(--border-color)]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={t.isDark ? "bg-slate-800/50" : "bg-slate-50"}>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">IP Address</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Location</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Time</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {dummyLogins.length > 0 ? dummyLogins.map(log => (
                      <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className={`p-4 text-sm font-bold ${t.isDark ? "text-white" : "text-slate-900"}`}>{log.ip}</td>
                        <td className="p-4 text-sm font-medium text-muted">{log.location}</td>
                        <td className="p-4 text-sm font-medium text-muted">{log.time}</td>
                        <td className="p-4">
                          <span className={`text-[10px] px-2 py-1 rounded-md font-black uppercase tracking-widest ${
                            log.status === 'Success' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-muted text-sm font-bold">No recent logins recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
