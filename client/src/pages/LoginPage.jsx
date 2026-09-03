import React, { useState } from 'react';
import { Building2, Lock, User, ArrowRight, ShieldCheck, Mail, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Use standard API URL resolution (assumes Vite proxy or direct URL)
const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login', 'forgot', 'verify'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('nakul.blackstoneinteriors@gmail.com');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        onLogin();
      } else {
        setError(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      setError('Connection error to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(`OTP sent to ${email}`);
        setMode('verify');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Connection error to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('Password reset successfully. You can now login.');
        setMode('login');
      } else {
        setError(data.message || 'Invalid OTP.');
      }
    } catch (err) {
      setError('Connection error to server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg)] dark:bg-slate-950 p-4 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 dark:bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <ShieldCheck className="text-white dark:text-slate-900" size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">System Login</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Authenticate to access the ERP</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 text-red-500 text-xs font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center">
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 text-emerald-500 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-center">
              {success}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-accent outline-none transition-all"
                      placeholder="admin"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Password</label>
                    <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }} className="text-[10px] font-bold text-accent hover:text-accent-hover uppercase tracking-widest transition-colors">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-accent outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-accent/20 transition-all flex justify-center items-center gap-2 group disabled:opacity-70">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Secure Login <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </motion.form>
            )}

            {mode === 'forgot' && (
              <motion.form key="forgot" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-500 dark:text-slate-400 font-bold outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex justify-center items-center gap-2 group disabled:opacity-70">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send OTP'}
                </button>
                <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="w-full text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">
                  Back to Login
                </button>
              </motion.form>
            )}

            {mode === 'verify' && (
              <motion.form key="verify" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">6-Digit OTP</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="123456"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="New password"
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex justify-center items-center gap-2 group disabled:opacity-70">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center border-t border-slate-200 dark:border-white/10 pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Personnel Only</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
