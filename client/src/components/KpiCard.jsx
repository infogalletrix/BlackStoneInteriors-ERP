import React from "react";
import { motion } from "framer-motion";
import { useThemeClasses } from "../hooks/useThemeClasses";

const fade = { 
  hidden: { opacity: 0, y: 12 }, 
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 95 } } 
};

export default function KpiCard({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  sub, 
  hideLeftStroke = false, 
  badge = null,
  onClick = null 
}) {
  const t = useThemeClasses();
  const d = t.isDark;

  return (
    <motion.div 
      variants={fade}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      whileTap={onClick ? { scale: 0.99 } : {}}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-4.5 ${t.card} ${t.cardHover} flex flex-col justify-between border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all ${onClick ? "cursor-pointer" : ""}`}
      style={{
        background: d 
          ? `linear-gradient(145deg, rgba(30, 41, 59, 0.75), rgba(15, 23, 42, 0.95))` 
          : `linear-gradient(145deg, #ffffff, #f9fafb)`,
        borderLeft: hideLeftStroke ? "none" : `4px solid ${color}`
      }}
    >
      {/* Background glow accent */}
      <div 
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-10 pointer-events-none"
        style={{ background: color }}
      />

      {/* Top row: Icon + Label + Badge */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span 
            className="p-2.5 rounded-xl shadow-sm border border-black/5 dark:border-white/5 inline-flex shrink-0 items-center justify-center" 
            style={{ background: `${color}18`, color }}
          >
            <Icon size={19} />
          </span>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate leading-snug">
            {label}
          </p>
        </div>

        {badge && (
          <span 
            className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 border"
            style={{ 
              background: `${color}14`, 
              color: color, 
              borderColor: `${color}28` 
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Bottom row: Value + Subtext */}
      <div className="pt-1">
        <p className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
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
