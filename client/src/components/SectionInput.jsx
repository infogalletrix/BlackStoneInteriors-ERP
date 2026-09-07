import React, { useState, useRef, useEffect } from "react";

/**
 * SectionInput
 * Pure text input with autocomplete suggestions derived strictly from
 * previously entered section data.
 * - No combobox dropdown arrow or default dropdown menu when empty
 * - Only suggests when the user types matching characters
 * - Full keyboard navigation (ArrowUp, ArrowDown, Enter, Tab, Escape)
 */
export default function SectionInput({
  value = "",
  onChange,
  suggestions = [],
  placeholder = "Section",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef(null);

  const currentVal = value || "";
  const query = currentVal.trim().toLowerCase();

  // Show suggestions only when user has typed at least 1 character
  // and exclude exact current match so popup closes when completed
  const matchingSuggestions = query.length > 0
    ? suggestions
        .filter(s => s && typeof s === "string" && s.trim().length > 0)
        .filter(s => s.toLowerCase().includes(query) && s.toLowerCase() !== query)
        .slice(0, 8)
    : [];

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setHighlightIdx(-1);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen && matchingSuggestions.length > 0 ? "z-40" : ""}`}
    >
      <input
        type="text"
        value={currentVal}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightIdx(-1);
        }}
        onFocus={() => {
          if (query.length > 0) setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (!isOpen || matchingSuggestions.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIdx(prev => (prev + 1) % matchingSuggestions.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIdx(prev => (prev - 1 + matchingSuggestions.length) % matchingSuggestions.length);
          } else if (e.key === "Enter" || e.key === "Tab") {
            if (highlightIdx >= 0 && highlightIdx < matchingSuggestions.length) {
              e.preventDefault();
              handleSelect(matchingSuggestions[highlightIdx]);
            }
          } else if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
        placeholder={placeholder}
        className={className || "w-full bg-transparent border-none outline-none text-themed text-xs px-1"}
        autoComplete="off"
        spellCheck="false"
      />

      {isOpen && matchingSuggestions.length > 0 && (
        <div className="absolute left-0 top-full mt-1 min-w-[150px] max-w-[240px] bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden py-1 z-50 backdrop-blur-md">
          <div className="text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 text-[var(--text-muted)] border-b border-[var(--border-color)] bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <span>Suggestions</span>
            <span className="text-[8px] opacity-70">previously entered</span>
          </div>
          <div className="max-h-40 overflow-y-auto divide-y divide-[var(--border-color)]/30">
            {matchingSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs text-[var(--text-primary)] transition-colors flex items-center justify-between ${
                  idx === highlightIdx
                    ? "bg-[var(--accent)] text-white font-bold"
                    : "hover:bg-[var(--accent-soft)] hover:text-amber-800 dark:hover:text-[var(--accent)]"
                }`}
              >
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
