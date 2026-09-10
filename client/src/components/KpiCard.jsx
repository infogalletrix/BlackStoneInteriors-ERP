import React from "react";
import { motion } from "framer-motion";
import { useThemeClasses } from "../hooks/useThemeClasses";

const fade = { 
  hidden: { opacity: 0, y: 16 }, 
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90 } } 
};

export default function KpiCard({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  sub, 
  hideLeftStroke, 
  badge = null,
  onClick = null 
}) {
  const t = useThemeClasses();
  const d = t.isDark;

  return (
    <motion.div 
      variants={fade}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 ${t.card} ${t.cardHover} flex flex-col justify-between border border-[var(--border-color)] shadow-sm transition-all ${onClick ? "cursor-pointer" : ""}`}
      style={{
        background: d 
          ? `linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))` 
          : `linear-gradient(145deg, #ffffff, #f8fafc)`,
        borderLeft: hideLeftStroke ? "none" : `4px solid ${color}`
      }}
    >
      {/* Background glow accent */}
      <div 
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-15 pointer-events-none"
        style={{ background: color }}
      />

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span 
            className="p-2.5 rounded-xl shadow-sm border border-black/5 dark:border-white/5 inline-flex shrink-0" 
            style={{ background: `${color}1a` }}
          >
            <Icon size={20} style={{ color }} />
          </span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {label}
          </span>
        </div>

        {badge && (
          <span 
            className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 border"
            style={{ 
              background: `${color}15`, 
              color: color, 
              borderColor: `${color}30` 
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="mt-1">
        <p className="text-xl sm:text-2xl font-black tracking-tight" style={{ color }}>
          {value}
        </p>
        {sub && (
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}
