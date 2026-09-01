import React, { useState } from 'react';
import { Building2, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for effect
    setTimeout(() => {
      const storedPassword = localStorage.getItem('adminPassword') || 'admin123';
      
      // Basic auth
      if (username === 'admin' && password === storedPassword) {
        onLogin();
      } else {
        setError('Invalid username or password.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F5F7] dark:bg-slate-950 p-4 transition-colors duration-300 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#9E8B6E]/10 dark:bg-[#9E8B6E]/20 rounded-full blur-[100px] pointer-events-none" />

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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-[#9E8B6E] outline-none transition-all"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-[#9E8B6E] outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-500 text-xs font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center">
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#9E8B6E] hover:bg-[#7D6C54] text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[#9E8B6E]/20 transition-all flex justify-center items-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Secure Login
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-200 dark:border-white/10 pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Personnel Only</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
