import { motion } from "framer-motion";
import { useThemeClasses } from "../hooks/useThemeClasses";

const fade = { 
  hidden: { opacity: 0, y: 16 }, 
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90 } } 
};

const KpiCard = ({ label, value, icon: Icon, color, sub, hideLeftStroke }) => {
  const t = useThemeClasses();
  const d = t.isDark;

  return (
    <motion.div variants={fade}
      className={`relative overflow-hidden rounded-lg p-5 ${t.card} ${t.cardHover} flex items-center gap-4 border border-[var(--border-color)]`}
      style={{
        background: d ? `linear-gradient(135deg, var(--bg-card), rgba(0,0,0,0.2))` : `linear-gradient(135deg, white, #f8f9fc)`,
        borderLeft: hideLeftStroke ? 'none' : `3px solid ${color}`
      }}>
      <div className="flex-shrink-0">
        <span className="p-3 rounded-lg shadow-sm border border-black/5 dark:border-white/5 inline-flex" style={{background: color+'22'}}>
          <Icon size={24} style={{color}}/>
        </span>
      </div>
      <div className="flex flex-col">
        <p className={t.label}>{label}</p>
        <p className="text-2xl font-black tracking-tight" style={{color}}>{value}</p>
        {sub && <p className={`${t.muted} mt-0.5`}>{sub}</p>}
      </div>
    </motion.div>
  );
};

export default KpiCard;
