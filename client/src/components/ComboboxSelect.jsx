import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, X, Check, Search, Settings, Plus } from "lucide-react";

/**
 * ComboboxSelect
 * Reusable dropdown menu + type to show letter-matched items.
 * - Allows typing freely into the input
 * - Shows dropdown menu with all items or filtered items
 * - Highlights matched letters in real-time
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Clear button
 * - Manage options action
 * - Supports single-line input or multiline textarea mode
 */
export default function ComboboxSelect({
  value = "",
  onChange,
  options = [],
  placeholder = "Select or type...",
  isTextArea = false,
  rows = 3,
  onOpenManage = null,
  manageLabel = "Manage Options",
  required = false,
  className = "",
  containerClassName = "",
  id = undefined
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const currentVal = value || "";
  const query = currentVal.trim().toLowerCase();

  // Filter options based on typed letters (letter-matching / substring matching)
  const filteredOptions = useMemo(() => {
    if (!query) return options;
    return options.filter(opt => 
      opt && typeof opt === "string" && opt.toLowerCase().includes(query)
    );
  }, [options, query]);

  // Highlight matched letters in option text
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

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(true);
    setHighlightIdx(-1);
    if (inputRef.current) inputRef.current.focus();
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
    if (!isOpen && inputRef.current) {
      inputRef.current.focus();
    }
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
      const items = listRef.current.querySelectorAll("[data-combobox-item]");
      if (items[highlightIdx]) {
        items[highlightIdx].scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightIdx, isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx(prev => {
        const next = prev + 1;
        return next >= filteredOptions.length ? 0 : next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx(prev => {
        const next = prev - 1;
        return next < 0 ? filteredOptions.length - 1 : next;
      });
    } else if (e.key === "Enter") {
      if (!isTextArea) {
        if (highlightIdx >= 0 && highlightIdx < filteredOptions.length) {
          e.preventDefault();
          handleSelect(filteredOptions[highlightIdx]);
        } else {
          setIsOpen(false);
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Tab") {
      if (highlightIdx >= 0 && highlightIdx < filteredOptions.length) {
        handleSelect(filteredOptions[highlightIdx]);
      }
      setIsOpen(false);
    }
  };

  const isExactMatch = options.some(opt => opt.toLowerCase() === query);

  return (
    <div ref={containerRef} className={`relative w-full ${containerClassName}`}>
      {/* Input or Textarea container */}
      <div className="relative flex items-center">
        {isTextArea ? (
          <textarea
            ref={inputRef}
            id={id}
            rows={rows}
            value={currentVal}
            onChange={(e) => {
              onChange(e.target.value);
              setIsOpen(true);
              setHighlightIdx(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            required={required}
            className={`w-full themed-input border border-[var(--border-color)] p-3 pr-16 rounded-xl text-xs outline-none focus:border-blue-500 resize-y transition ${className}`}
          />
        ) : (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={currentVal}
            onChange={(e) => {
              onChange(e.target.value);
              setIsOpen(true);
              setHighlightIdx(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            required={required}
            className={`w-full themed-input border border-[var(--border-color)] px-3 py-2 pr-16 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 transition ${className}`}
            autoComplete="off"
            spellCheck="false"
          />
        )}

        {/* Right side actions: Clear & Dropdown Chevron */}
        <div className={`absolute right-2 flex items-center gap-1 ${isTextArea ? "top-2.5" : "top-1/2 -translate-y-1/2"}`}>
          {currentVal && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition"
              title="Clear input"
            >
              <X size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={toggleDropdown}
            className={`p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition ${isOpen ? "text-blue-600 rotate-180" : ""}`}
            title="Toggle options menu"
          >
            <ChevronDown size={16} className="transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl animate-fadeIn">
          {/* Header with info & count */}
          <div className="px-3 py-1.5 bg-black/5 dark:bg-white/5 border-b border-[var(--border-color)] flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Search size={11} className="opacity-70" />
              {query ? `Matches (${filteredOptions.length})` : `All Presets (${options.length})`}
            </span>
            {onOpenManage && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onOpenManage();
                  setIsOpen(false);
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 normal-case text-[10px] font-extrabold"
              >
                <Settings size={10} /> {manageLabel}
              </button>
            )}
          </div>

          {/* Options List */}
          <div ref={listRef} className="max-h-56 overflow-y-auto divide-y divide-[var(--border-color)]/30">
            {/* If user typed a custom value that isn't an exact match */}
            {query && !isExactMatch && (
              <button
                type="button"
                data-combobox-item
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(currentVal.trim());
                }}
                className="w-full text-left px-3 py-2 text-xs transition flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 font-semibold"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Plus size={13} className="text-blue-600 shrink-0" />
                  <span>Use typed: <strong className="underline">{currentVal.trim()}</strong></span>
                </span>
                <span className="text-[10px] opacity-70 uppercase tracking-wider font-bold shrink-0 ml-2">Custom</span>
              </button>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.toLowerCase() === query;
                const isHighlighted = idx === highlightIdx;

                return (
                  <button
                    key={idx}
                    type="button"
                    data-combobox-item
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between ${
                      isHighlighted
                        ? "bg-blue-600 text-white font-bold"
                        : isSelected
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
                        : "text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="leading-snug pr-2">
                      {renderHighlighted(opt, query)}
                    </span>
                    {isSelected && (
                      <Check size={14} className={isHighlighted ? "text-white" : "text-blue-600 shrink-0"} />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-center text-xs text-slate-400 font-medium">
                No matching preset found. You can keep your custom typed text!
              </div>
            )}
          </div>

          {/* Footer quick action */}
          {onOpenManage && (
            <div className="p-1.5 bg-black/5 dark:bg-white/5 border-t border-[var(--border-color)] flex justify-end">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onOpenManage();
                  setIsOpen(false);
                }}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-blue-500/10 transition"
              >
                <Settings size={12} /> {manageLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
