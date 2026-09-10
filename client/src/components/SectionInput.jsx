import React, { useState, useRef, useEffect, useMemo } from "react";
import { Tag, History, Check, X } from "lucide-react";

/**
 * SectionInput
 * Text input that allows free typing while showing suggestions from previously typed inputs.
 * - Shows previously entered sections when focused or typed
 * - Letter-matching filter with matched characters highlighted
 * - Keyboard navigation (Arrow keys, Enter, Tab, Escape)
 * - Retains custom typed text completely
 */
export default function SectionInput({
  value = "",
  onChange,
  suggestions = [],
  placeholder = "e.g. Living Room, Master Bedroom, Kitchen",
  className = "",
  containerClassName = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const currentVal = value || "";
  const query = currentVal.trim().toLowerCase();

  // Deduplicate and clean suggestions
  const cleanSuggestions = useMemo(() => {
    return Array.from(
      new Set(
        suggestions
          .filter(s => s && typeof s === "string" && s.trim().length > 0)
          .map(s => s.trim())
      )
    );
  }, [suggestions]);

  // Filter suggestions by typed letters
  const filteredSuggestions = useMemo(() => {
    if (!query) {
      // If empty, show first 8 previously entered sections
      return cleanSuggestions.slice(0, 8);
    }
    return cleanSuggestions
      .filter(s => s.toLowerCase().includes(query))
      .slice(0, 8);
  }, [cleanSuggestions, query]);

  // Highlight matched letters
  const renderHighlighted = (text, q) => {
    if (!q || !text) return text;
    const lowerText = text.toLowerCase();
    const idx = lowerText.indexOf(q);
    if (idx === -1) return text;

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);

    return (
      <span>
        {before}
        <span className="bg-amber-500/25 dark:bg-amber-400/30 text-amber-900 dark:text-amber-200 font-black rounded px-0.5 underline decoration-amber-500/50">
          {match}
        </span>
        {after}
      </span>
    );
  };

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

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-section-item]");
      if (items[highlightIdx]) {
        items[highlightIdx].scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightIdx, isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === "ArrowDown" && cleanSuggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx(prev => {
        const next = prev + 1;
        return next >= filteredSuggestions.length ? 0 : next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx(prev => {
        const next = prev - 1;
        return next < 0 ? filteredSuggestions.length - 1 : next;
      });
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (highlightIdx >= 0 && highlightIdx < filteredSuggestions.length) {
        e.preventDefault();
        handleSelect(filteredSuggestions[highlightIdx]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${containerClassName || ""}`}
    >
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={currentVal}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightIdx(-1);
          }}
          onFocus={() => {
            if (cleanSuggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={
            className ||
            "w-full themed-input border border-[var(--border-color)] px-3 py-2 pr-8 rounded-xl text-sm font-semibold outline-none focus:border-[#C9A227] transition"
          }
          autoComplete="off"
          spellCheck="false"
        />

        {currentVal && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setIsOpen(true);
              setHighlightIdx(-1);
              if (inputRef.current) inputRef.current.focus();
            }}
            className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition"
            title="Clear section"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl animate-fadeIn">
          <div className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 text-slate-500 dark:text-slate-400 border-b border-[var(--border-color)] bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <History size={11} className="opacity-70" />
              Previously Entered Sections
            </span>
            <span className="text-[9px] opacity-70">Type or pick</span>
          </div>

          <div ref={listRef} className="max-h-48 overflow-y-auto divide-y divide-[var(--border-color)]/30">
            {filteredSuggestions.map((item, idx) => {
              const isSelected = item.toLowerCase() === query;
              const isHighlighted = idx === highlightIdx;

              return (
                <button
                  key={idx}
                  type="button"
                  data-section-item
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between ${
                    isHighlighted
                      ? "bg-[#C9A227] text-white font-bold"
                      : isSelected
                      ? "bg-amber-500/10 text-amber-700 dark:text-[var(--accent)] font-bold"
                      : "text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Tag size={12} className={isHighlighted ? "text-white" : "text-slate-400 shrink-0"} />
                    <span>{renderHighlighted(item, query)}</span>
                  </span>
                  {isSelected && (
                    <Check size={13} className={isHighlighted ? "text-white" : "text-amber-700 dark:text-[var(--accent)] shrink-0"} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
