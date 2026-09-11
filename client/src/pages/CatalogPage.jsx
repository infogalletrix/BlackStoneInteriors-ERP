import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Layers,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  RotateCcw,
  Sparkles,
  FolderTree,
  Sliders,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useDialog } from "../contexts/DialogContext";
import { useThemeClasses } from "../hooks/useThemeClasses";

export const DEFAULT_PRODUCTS = [
  "Kitchen Cabinets",
  "Wardrobe",
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

export const DEFAULT_CATEGORIES = [
  "Carcass / Core Structure",
  "Shutters & Fascia",
  "Hardware & Hinges",
  "Drawers & Runners",
  "Handles & Profiles",
  "Internal Accessories & Wirework",
  "Countertop & Splashback",
  "Glass & Aluminum Profiles",
  "Cove & Accent Lighting",
  "Paneling & Framing",
  "Cushioning & Upholstery",
  "Finishing & PU / Melamine Polish"
];

export const DEFAULT_SPECIFICATIONS = [
  "Commercial Plywood with 0.8mm Mica Finish & Soft-close Hardware",
  "BWP Marine Ply with 1mm Laminate & Telescopic Channels",
  "HDHMR with Acrylic Finish & Hafele Soft-Close Hinges",
  "18mm BWP Boiling Water Resistant ply with .8mm Internal Laminate",
  "Glass Shutter - Tinted Glass/Looking Mirror in 45mm Profile",
  "25mm HDHMR with CNC + PU Finish",
  "Hinge - Hettich - 32mm - 0 Crank - Made in Germany",
  "Hettich - Innotech Drawer - Soft Close - Made in Germany",
  "CNC V Groove Handle / Profile Handle",
  "PVC Cutlery Tray - Hettich - 900mm",
  "Higold Matt Black Bottle Pullout - 2 layer - 300mm",
  "Rolling Shutter - Rehau 600mm Aluminium",
  "Built-in Profile light with Adaptor",
  "Quartz Stone Countertop with Beveled Edge & Sink Cutout",
  "Natural Teak Veneer with Melamine Matte Polish",
  "Solid Wood Frame with Brass Inlay Detailing",
  "Custom Design & Fabrication as per Approved 3D Views",
  "Standard Material & Hardware as per Site Specifications"
];

export default function CatalogPage() {
  const { showDialog } = useDialog();
  const t = useThemeClasses();

  const [activeTab, setActiveTab] = useState("products"); // 'products' | 'categories' | 'specifications'
  const [products, setProducts] = useState(() => {
    try {
      const s = localStorage.getItem("quote_products");
      return s ? JSON.parse(s) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const s = localStorage.getItem("quote_categories");
      return s ? JSON.parse(s) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [specifications, setSpecifications] = useState(() => {
    try {
      const s = localStorage.getItem("quote_specifications");
      return s ? JSON.parse(s) : DEFAULT_SPECIFICATIONS;
    } catch {
      return DEFAULT_SPECIFICATIONS;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editText, setEditText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync with backend on mount
  useEffect(() => {
    fetch("/api/catalog")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
            localStorage.setItem("quote_products", JSON.stringify(data.products));
          }
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
            localStorage.setItem("quote_categories", JSON.stringify(data.categories));
          }
          if (Array.isArray(data.specifications) && data.specifications.length > 0) {
            setSpecifications(data.specifications);
            localStorage.setItem("quote_specifications", JSON.stringify(data.specifications));
          }
        }
      })
      .catch((err) => console.log("Catalog offline/local fallback:", err));
  }, []);

  // Save to backend + localStorage
  const saveCatalogState = async (newP = products, newC = categories, newS = specifications) => {
    localStorage.setItem("quote_products", JSON.stringify(newP));
    localStorage.setItem("quote_categories", JSON.stringify(newC));
    localStorage.setItem("quote_specifications", JSON.stringify(newS));

    try {
      setIsSaving(true);
      await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: newP,
          categories: newC,
          specifications: newS,
        }),
      });
    } catch (e) {
      console.warn("Failed to sync catalog to server:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // Active list definition
  const currentTabConfig = useMemo(() => {
    if (activeTab === "products") {
      return {
        key: "products",
        title: "Products",
        singular: "Product",
        icon: <Package size={18} />,
        list: products,
        setList: (newList) => {
          setProducts(newList);
          saveCatalogState(newList, categories, specifications);
        },
        placeholder: "Enter new product (e.g. Wardrobe, Kitchen Cabinets, TV Unit)...",
        color: "from-amber-600 to-amber-700",
        badgeColor: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300/40",
      };
    }
    if (activeTab === "categories") {
      return {
        key: "categories",
        title: "Categories",
        singular: "Category",
        icon: <FolderTree size={18} />,
        list: categories,
        setList: (newList) => {
          setCategories(newList);
          saveCatalogState(products, newList, specifications);
        },
        placeholder: "Enter new category (e.g. Carcass, Shutters, Hardware, Accessories)...",
        color: "from-teal-600 to-teal-700",
        badgeColor: "bg-teal-100 text-teal-900 dark:bg-teal-900/30 dark:text-teal-300 border-teal-300/40",
      };
    }
    return {
      key: "specifications",
      title: "Specifications",
      singular: "Specification",
      icon: <FileText size={18} />,
      list: specifications,
      setList: (newList) => {
        setSpecifications(newList);
        saveCatalogState(products, categories, newList);
      },
      placeholder: "Enter new specification (e.g. 18mm BWP Marine Ply with 1mm Laminate)...",
      color: "from-blue-600 to-blue-700",
      badgeColor: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300/40",
    };
  }, [activeTab, products, categories, specifications]);

  // Filtered items
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentTabConfig.list;
    const q = searchQuery.toLowerCase();
    return currentTabConfig.list.filter((item) => item.toLowerCase().includes(q));
  }, [currentTabConfig.list, searchQuery]);

  // Actions
  const handleAddItem = (e) => {
    e?.preventDefault();
    const val = newItemText.trim();
    if (!val) return;

    if (currentTabConfig.list.some((item) => item.toLowerCase() === val.toLowerCase())) {
      showDialog({
        title: "Duplicate Item",
        message: `"${val}" is already in ${currentTabConfig.title}.`,
        type: "alert",
      });
      return;
    }

    const updated = [...currentTabConfig.list, val];
    currentTabConfig.setList(updated);
    setNewItemText("");
  };

  const handleStartEdit = (idx, text) => {
    setEditingIdx(idx);
    setEditText(text);
  };

  const handleSaveEdit = (idx) => {
    const val = editText.trim();
    if (!val) return;

    const oldVal = currentTabConfig.list[idx];
    if (val !== oldVal && currentTabConfig.list.some((item, i) => i !== idx && item.toLowerCase() === val.toLowerCase())) {
      showDialog({
        title: "Duplicate Item",
        message: `"${val}" already exists in ${currentTabConfig.title}.`,
        type: "alert",
      });
      return;
    }

    const updated = [...currentTabConfig.list];
    updated[idx] = val;
    currentTabConfig.setList(updated);
    setEditingIdx(null);
    setEditText("");
  };

  const handleDeleteItem = (idx) => {
    const itemToDelete = currentTabConfig.list[idx];
    showDialog({
      title: `Delete ${currentTabConfig.singular}`,
      message: `Are you sure you want to remove "${itemToDelete}" from ${currentTabConfig.title}?`,
      type: "confirm",
      onConfirm: () => {
        const updated = currentTabConfig.list.filter((_, i) => i !== idx);
        currentTabConfig.setList(updated);
      },
    });
  };

  const handleResetToDefaults = () => {
    showDialog({
      title: "Reset Catalog",
      message: "Reset all Products, Categories, and Specifications to factory defaults?",
      type: "confirm",
      onConfirm: async () => {
        setProducts(DEFAULT_PRODUCTS);
        setCategories(DEFAULT_CATEGORIES);
        setSpecifications(DEFAULT_SPECIFICATIONS);
        await saveCatalogState(DEFAULT_PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_SPECIFICATIONS);
        try {
          await fetch("/api/catalog/reset", { method: "POST" });
        } catch {}
      },
    });
  };

  return (
    <div className="page-wrapper min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0b1e36] via-[#0d5c63] to-[#C9A227] flex items-center justify-center text-white shadow-md">
              <Package size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-themed tracking-tight uppercase">
                Catalog Management
              </h1>
              <p className="text-xs text-muted font-medium">
                Master database for Products, Categories, and Technical Specifications
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition border border-[var(--border-color)] shadow-sm"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
        </div>
      </div>

      {/* ── HIERARCHY EXPLANATION BANNER ── */}
      <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-blue-500/10 border border-[var(--border-color)] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] animate-pulse"></span>
          <span className="font-extrabold text-themed uppercase tracking-wider text-[11px]">
            Catalog Hierarchy Structure:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
          <span className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300">
            1. Product (e.g. Wardrobe, Kitchen)
          </span>
          <ArrowRight size={14} className="text-slate-400" />
          <span className="px-3 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-800 dark:text-teal-300">
            2. Category (e.g. Carcass, Shutters, Hardware)
          </span>
          <ArrowRight size={14} className="text-slate-400" />
          <span className="px-3 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-800 dark:text-blue-300">
            3. Specification & Material (e.g. 18mm BWP Marine Ply...)
          </span>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tab 1: Products */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("products");
            setEditingIdx(null);
            setSearchQuery("");
          }}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between ${
            activeTab === "products"
              ? "bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/30 shadow-md"
              : "bg-white dark:bg-slate-900 border-[var(--border-color)] hover:border-amber-400/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                activeTab === "products"
                  ? "bg-amber-600 text-white shadow"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}
            >
              <Package size={20} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Level 1</div>
              <div className="text-sm sm:text-base font-black text-themed">Products</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            {products.length}
          </span>
        </button>

        {/* Tab 2: Categories */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("categories");
            setEditingIdx(null);
            setSearchQuery("");
          }}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between ${
            activeTab === "categories"
              ? "bg-teal-500/10 border-teal-500/60 ring-2 ring-teal-500/30 shadow-md"
              : "bg-white dark:bg-slate-900 border-[var(--border-color)] hover:border-teal-400/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                activeTab === "categories"
                  ? "bg-teal-600 text-white shadow"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}
            >
              <FolderTree size={20} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Level 2 (Middle)</div>
              <div className="text-sm sm:text-base font-black text-themed">Categories</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
            {categories.length}
          </span>
        </button>

        {/* Tab 3: Specifications */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("specifications");
            setEditingIdx(null);
            setSearchQuery("");
          }}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between ${
            activeTab === "specifications"
              ? "bg-blue-500/10 border-blue-500/60 ring-2 ring-blue-500/30 shadow-md"
              : "bg-white dark:bg-slate-900 border-[var(--border-color)] hover:border-blue-400/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                activeTab === "specifications"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}
            >
              <FileText size={20} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Level 3</div>
              <div className="text-sm sm:text-base font-black text-themed">Specifications</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
            {specifications.length}
          </span>
        </button>
      </div>

      {/* ── ACTIONS BAR (ADD & SEARCH) ── */}
      <div className="themed-card p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] space-y-4 shadow-sm">
        {/* Add Input Form */}
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder={currentTabConfig.placeholder}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-[var(--border-color)] bg-white dark:bg-slate-900 text-sm font-semibold text-themed outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition shadow-inner"
            />
            {newItemText && (
              <button
                type="button"
                onClick={() => setNewItemText("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!newItemText.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0b1e36] to-[#0d5c63] hover:from-[#112d52] hover:to-[#127a85] text-white font-bold text-sm shadow-md transition disabled:opacity-40 shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} /> Add {currentTabConfig.singular}
          </button>
        </form>

        {/* Search Bar & Count */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border-color)]">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Filter ${currentTabConfig.title.toLowerCase()}...`}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-[var(--border-color)] bg-slate-50 dark:bg-slate-900/60 text-xs text-themed outline-none focus:border-amber-500 transition"
            />
          </div>
          <span className="text-xs font-bold text-muted">
            Showing {filteredList.length} of {currentTabConfig.list.length} entries
          </span>
        </div>
      </div>

      {/* ── LIST OF ITEMS ── */}
      <div className="themed-card rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/80 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-xs uppercase tracking-wider text-themed">
              {currentTabConfig.title} Master Records
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Click edit icon to modify • Changes reflect immediately across all quotations
          </span>
        </div>

        <div className="divide-y divide-[var(--border-color)]">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center text-muted">
              <Package size={36} className="mx-auto mb-2.5 opacity-30" />
              <p className="font-bold text-sm">No {currentTabConfig.title.toLowerCase()} found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery ? "Try a different search term" : "Add your first entry above"}
              </p>
            </div>
          ) : (
            filteredList.map((item, idx) => {
              const realIndex = currentTabConfig.list.indexOf(item);
              const isEditing = editingIdx === realIndex;

              return (
                <div
                  key={idx}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition group"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>

                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 max-w-2xl">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(realIndex);
                            if (e.key === "Escape") setEditingIdx(null);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-amber-500 bg-white dark:bg-slate-900 text-sm font-bold text-themed outline-none ring-2 ring-amber-500/20"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(realIndex)}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingIdx(null)}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-themed leading-snug break-words">
                        {item}
                      </span>
                    )}
                  </div>

                  {/* Row Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(realIndex, item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
                        title="Edit name"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(realIndex)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
