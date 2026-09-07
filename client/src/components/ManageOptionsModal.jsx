import React, { useState } from "react";
import { X, Plus, Edit3, Trash2, Check, RotateCcw, Search, Sliders } from "lucide-react";

export const DEFAULT_PRODUCTS = [
  "Wardrobe",
  "Kitchen Cabinets",
  "TV Unit",
  "False Ceiling",
  "Shoe Rack",
  "Study Table & Bookshelf",
  "Dresser & Mirror",
  "Crockery Unit",
  "Wall Paneling",
  "Foyer Console",
  "Pooja Unit",
  "Vanity Cabinet",
  "Bed with Storage",
  "Headboard Cushioning",
  "Loose Furniture",
  "Civil & Flooring",
  "Electrical & Lighting",
  "Painting & Polish"
];

export const DEFAULT_SPECIFICATIONS = [
  "Commercial Plywood with 0.8mm Mica Finish & Soft-close Hardware",
  "BWP Marine Ply with 1mm Laminate & Telescopic Channels",
  "HDHMR with Acrylic Finish & Hafele Soft-Close Hinges",
  "MDF with High Gloss PU Paint & Profile Handles",
  "Gypsum Board False Ceiling with Cove Lighting Provision",
  "Toughened Fluted Glass with Aluminum Profile Shutter",
  "Quartz Stone Countertop with Beveled Edge & Sink Cutout",
  "Natural Teak Veneer with Melamine Matte Polish",
  "Solid Wood Frame with Brass Inlay Detailing",
  "Custom Design & Fabrication as per Approved 3D Views",
  "Standard Material & Hardware as per Site Specifications"
];

export default function ManageOptionsModal({
  isOpen,
  onClose,
  activeTab = "products",
  setActiveTab,
  productsList,
  setProductsList,
  specificationsList,
  setSpecificationsList,
  onRenameOption
}) {
  const [newOptionText, setNewOptionText] = useState("");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editText, setEditText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const currentTab = activeTab === "specifications" ? "specifications" : "products";

  const getListAndSetter = () => {
    if (currentTab === "specifications") {
      return {
        list: specificationsList,
        setList: setSpecificationsList,
        defaults: DEFAULT_SPECIFICATIONS,
        label: "Specification",
        placeholder: "Enter new specification details..."
      };
    } else {
      return {
        list: productsList,
        setList: setProductsList,
        defaults: DEFAULT_PRODUCTS,
        label: "Product",
        placeholder: "Enter new product (e.g., Shoe Rack, TV Unit)..."
      };
    }
  };

  const { list, setList, defaults, label, placeholder } = getListAndSetter();

  const handleAdd = () => {
    const trimmed = newOptionText.trim();
    if (!trimmed) return;
    if (list.some(item => item.toLowerCase() === trimmed.toLowerCase())) {
      alert(`"${trimmed}" already exists in ${label} options.`);
      return;
    }
    const updated = [...list, trimmed];
    setList(updated);
    setNewOptionText("");
  };

  const handleStartEdit = (idx, text) => {
    setEditingIdx(idx);
    setEditText(text);
  };

  const handleSaveEdit = (idx) => {
    const trimmed = editText.trim();
    const oldVal = list[idx];
    if (trimmed && trimmed !== oldVal) {
      if (list.some((item, i) => i !== idx && item.toLowerCase() === trimmed.toLowerCase())) {
        alert(`"${trimmed}" already exists.`);
        return;
      }
      const updated = [...list];
      updated[idx] = trimmed;
      setList(updated);
      if (onRenameOption) {
        onRenameOption(currentTab, oldVal, trimmed);
      }
    }
    setEditingIdx(null);
    setEditText("");
  };

  const handleDelete = (idx) => {
    if (list.length <= 1) {
      alert(`You must keep at least one ${label} option.`);
      return;
    }
    const updated = list.filter((_, i) => i !== idx);
    setList(updated);
  };

  const handleResetDefaults = () => {
    if (window.confirm(`Reset ${label} options to standard interior design defaults?`)) {
      setList(defaults);
      setEditingIdx(null);
    }
  };

  const filteredList = list.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--accent-soft)] text-amber-700 dark:text-[var(--accent)]">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="font-black text-base text-[var(--text-primary)]">Manage Dropdown Options</h3>
              <p className="text-xs text-[var(--text-muted)]">Configure options used in Quotation & Billing forms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-2 bg-[var(--bg-surface)] border-b border-[var(--border-color)] gap-1.5 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab("products");
              setEditingIdx(null);
              setSearchQuery("");
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              currentTab === "products"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span>Products</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                currentTab === "products" ? "bg-white/20 text-white" : "bg-slate-500/10 text-slate-500"
              }`}
            >
              {productsList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("specifications");
              setEditingIdx(null);
              setSearchQuery("");
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              currentTab === "specifications"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span>Specifications</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                currentTab === "specifications" ? "bg-white/20 text-white" : "bg-slate-500/10 text-slate-500"
              }`}
            >
              {specificationsList.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex flex-col flex-1 overflow-hidden gap-3">
          {/* Add Form */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={placeholder}
              value={newOptionText}
              onChange={e => setNewOptionText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleAdd();
              }}
              className="flex-1 themed-input border border-[var(--border-color)] px-3 py-2 text-xs rounded-xl outline-none focus:border-[var(--accent)] font-medium"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:opacity-90 shadow-sm transition-all flex-shrink-0"
            >
              <Plus size={14} strokeWidth={3} />
              <span>Add</span>
            </button>
          </div>

          {/* Search Bar if > 4 items */}
          {list.length > 4 && (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${label} options...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg outline-none text-[var(--text-primary)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[180px] max-h-[340px]">
            {filteredList.map((item, idx) => {
              const actualIdx = list.indexOf(item);
              const isEditing = editingIdx === actualIdx;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl transition-colors hover:border-[var(--accent)]/40 group"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        autoFocus
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") handleSaveEdit(actualIdx);
                          if (e.key === "Escape") setEditingIdx(null);
                        }}
                        className="flex-1 themed-input px-2 py-1 text-xs outline-none font-bold rounded-lg border border-[var(--accent)]"
                      />
                      <button
                        onClick={() => handleSaveEdit(actualIdx)}
                        className="p-1 rounded-lg bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                        title="Save"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingIdx(null)}
                        className="p-1 rounded-lg bg-rose-500/20 text-rose-500 hover:bg-rose-500/30"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 mr-2 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                        {actualIdx + 1}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-primary)] break-words">
                        {item}
                      </span>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(actualIdx, item)}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors"
                        title="Edit Option"
                      >
                        <Edit3 size={13} />
                      </button>
                      {list.length > 1 && (
                        <button
                          onClick={() => handleDelete(actualIdx)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete Option"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredList.length === 0 && (
              <div className="py-8 text-center text-xs text-[var(--text-muted)] font-bold">
                {searchQuery ? "No matching options found" : `No ${label.toLowerCase()} options available`}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex justify-between items-center">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[var(--text-primary)] transition-colors px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            title="Reset options to defaults"
          >
            <RotateCcw size={12} />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[var(--accent)] text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
