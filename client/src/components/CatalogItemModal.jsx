import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Package,
  FolderTree,
  FileText,
  Check,
  AlertCircle,
  Percent,
  DollarSign,
  Sparkles,
  Tag
} from "lucide-react";
import ComboboxSelect from "./ComboboxSelect";

export default function CatalogItemModal({
  isOpen,
  onClose,
  onSave,
  catalogTree = [],
  presetCategories = [],
  standardUnits = ["Sq.Ft", "R.Ft", "Nos", "Sets", "L.S", "R.Mtr", "Sq.Mtr"],
  initialProduct = "",
  initialCategory = ""
}) {
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [specification, setSpecification] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [unit, setUnit] = useState("Sq.Ft");
  const [discountType, setDiscountType] = useState("percent"); // 'percent' | 'price'
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [validationError, setValidationError] = useState("");

  // Reset and pre-fill when opened
  useEffect(() => {
    if (isOpen) {
      setProduct(initialProduct || "");
      setCategory(initialCategory || "");
      setSpecification("");
      setUnitPrice("");
      setUnit("Sq.Ft");
      setDiscountType("percent");
      setDiscountPercent("");
      setDiscountPrice("");
      setValidationError("");
    }
  }, [isOpen, initialProduct, initialCategory]);

  // Clean list of unique existing product names
  const availableProducts = useMemo(() => {
    if (!catalogTree || catalogTree.length === 0) return [];
    return catalogTree.map((p) => p.name).filter(Boolean);
  }, [catalogTree]);

  // Cascading categories based on typed or selected product
  const availableCategories = useMemo(() => {
    const list = [];
    if (product && catalogTree && catalogTree.length > 0) {
      const match = catalogTree.find(
        (p) => p.name.trim().toLowerCase() === product.trim().toLowerCase()
      );
      if (match && Array.isArray(match.categories)) {
        list.push(...match.categories.map((c) => c.name).filter(Boolean));
      }
    }
    // Add preset categories (excluding duplicates)
    if (presetCategories && presetCategories.length > 0) {
      presetCategories.forEach((cat) => {
        if (!list.some((c) => c.toLowerCase() === cat.toLowerCase())) {
          list.push(cat);
        }
      });
    }
    return list;
  }, [product, catalogTree, presetCategories]);

  if (!isOpen) return null;

  // Rate & Discount Handlers
  const handlePriceChange = (val) => {
    const clean = val.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
    setUnitPrice(clean);
    const numPrice = parseFloat(clean) || 0;
    if (discountType === "price" && discountPrice && numPrice > 0) {
      const dp = parseFloat(discountPrice) || 0;
      const p = (((numPrice - dp) / numPrice) * 100).toFixed(1);
      setDiscountPercent(p > 0 ? p : "0");
    } else if (discountPercent && numPrice > 0) {
      const p = parseFloat(discountPercent) || 0;
      const dp = numPrice - (numPrice * p) / 100;
      setDiscountPrice(dp > 0 ? dp.toFixed(2) : "0");
    }
  };

  const handleDiscountPercentChange = (val) => {
    const clean = val.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
    setDiscountPercent(clean);
    const numPrice = parseFloat(unitPrice) || 0;
    if (clean && parseFloat(clean) > 0 && numPrice > 0) {
      const p = parseFloat(clean);
      const dp = numPrice - (numPrice * p) / 100;
      setDiscountPrice(dp > 0 ? dp.toFixed(2) : "0");
    } else {
      setDiscountPrice("");
    }
  };

  const handleDiscountPriceChange = (val) => {
    const clean = val.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
    setDiscountPrice(clean);
    const numPrice = parseFloat(unitPrice) || 0;
    if (clean && parseFloat(clean) > 0 && numPrice > 0) {
      const dp = parseFloat(clean);
      const p = (((numPrice - dp) / numPrice) * 100).toFixed(1);
      setDiscountPercent(p > 0 ? p : "0");
    } else {
      setDiscountPercent("");
    }
  };

  const handleToggleDiscountType = () => {
    setDiscountType((prev) => (prev === "percent" ? "price" : "percent"));
  };

  // Real-time calculation
  const numericPrice = parseFloat(unitPrice) || 0;
  let effectivePrice = numericPrice;
  if (discountType === "percent" && discountPercent) {
    const p = parseFloat(discountPercent) || 0;
    effectivePrice = Math.max(0, numericPrice - (numericPrice * p) / 100);
  } else if (discountType === "price" && discountPrice) {
    const dp = parseFloat(discountPrice) || 0;
    effectivePrice = Math.max(0, dp);
  }

  const validateAndBuild = () => {
    const trimmedProduct = product.trim();
    if (!trimmedProduct) {
      setValidationError("Please enter or select a Product name.");
      return null;
    }

    const trimmedCategory = category.trim();
    const trimmedSpec = specification.trim();

    // If specification is provided, category is required to know where to place it
    if (trimmedSpec && !trimmedCategory) {
      setValidationError("Please select or enter a Category for this specification.");
      return null;
    }

    // If specification is provided, unitPrice is mandatory
    if (trimmedSpec) {
      const parsedPrice = parseFloat(unitPrice);
      if (!unitPrice || isNaN(parsedPrice) || parsedPrice <= 0) {
        setValidationError("Unit Price is required and must be greater than 0 when adding a specification.");
        return null;
      }
    }

    setValidationError("");
    return {
      product: trimmedProduct,
      category: trimmedCategory,
      specification: trimmedSpec,
      unitPrice: trimmedSpec ? parseFloat(unitPrice) : null,
      unit: unit || "Sq.Ft",
      discountType,
      discountPercent: discountPercent ? parseFloat(discountPercent) : null,
      discountPrice: discountPrice ? parseFloat(discountPrice) : null
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = validateAndBuild();
    if (!data) return;
    onSave(data);
    onClose();
  };

  const handleSaveAndAddAnother = (e) => {
    e.preventDefault();
    const data = validateAndBuild();
    if (!data) return;
    onSave(data);
    // Keep product and category for rapid entry of more specs!
    setSpecification("");
    setUnitPrice("");
    setDiscountPercent("");
    setDiscountPrice("");
    setValidationError("");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header matching project secondary gold color */}
        <div className="bg-gradient-to-r from-[#B8911F] via-[#C9A227] to-[#D4AF37] px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide uppercase flex items-center gap-2">
                Add to Master Catalog
              </h3>
              <p className="text-[11px] text-amber-100 font-medium">
                Enter product, category, specification, and unit rate details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition"
            title="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Validation Error Alert */}
          {validationError && (
            <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center gap-2.5 text-xs font-bold text-red-600 dark:text-red-400">
              <AlertCircle size={16} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Row 1: Product Selection or Entry */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Package size={13} className="text-[#C9A227]" /> Product Name <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">
                Select existing or type a new product
              </span>
            </div>
            <ComboboxSelect
              value={product}
              onChange={(val) => {
                setProduct(val);
                setValidationError("");
              }}
              options={availableProducts}
              placeholder="Search or type product (e.g. Kitchen Cabinets, Wardrobe, Bar Counter)..."
              required
            />
          </div>

          {/* Row 2: Category Selection or Entry */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <FolderTree size={13} className="text-teal-600" /> Category
              </label>
              {product && availableCategories.length > 0 ? (
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                  {availableCategories.length} categories available
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold">
                  Optional (leave empty if adding product only)
                </span>
              )}
            </div>
            <ComboboxSelect
              value={category}
              onChange={(val) => {
                setCategory(val);
                setValidationError("");
              }}
              options={availableCategories}
              placeholder="Search or type category (e.g. Carcass, Shutters, Hardware)..."
            />
          </div>

          {/* Row 3: Specification Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <FileText size={13} className="text-emerald-600" /> Specification & Material Description
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">
                Optional if only adding product/category
              </span>
            </div>
            <input
              type="text"
              value={specification}
              onChange={(e) => {
                setSpecification(e.target.value);
                setValidationError("");
              }}
              placeholder="Material description (e.g. 18mm BWP Marine Ply with 0.8mm White Internal Laminate)..."
              className="w-full themed-input border border-[var(--border-color)] px-3 py-2 text-xs font-semibold rounded-xl outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Row 4: Pricing & Discount Details (Active when specification is entered or filling rates) */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-900/50 border border-[var(--border-color)] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" /> Rates & Discount Settings
              </span>
              {specification.trim() && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Rate Required for Spec
                </span>
              )}
            </div>

            <div className="grid grid-cols-12 gap-3">
              {/* Unit Price */}
              <div className="col-span-5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Unit Price (₹) {specification.trim() && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={unitPrice}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 text-xs font-black rounded-xl border border-[var(--border-color)] bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                  />
                </div>
              </div>

              {/* Unit Selector */}
              <div className="col-span-3">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-bold rounded-xl border border-[var(--border-color)] bg-white dark:bg-slate-900 focus:outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  {standardUnits.map((u, idx) => (
                    <option key={idx} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Discount Input & Type Toggle */}
              <div className="col-span-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">
                    Disc ({discountType === "price" ? "₹" : "%"})
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleDiscountType}
                    className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-[var(--accent)] border border-amber-500/30 hover:bg-amber-500/20 transition"
                    title="Switch between Percentage and Fixed Price discount"
                  >
                    {discountType === "price" ? "Switch to %" : "Switch to ₹"}
                  </button>
                </div>
                <div className="relative">
                  {discountType === "price" && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                  )}
                  <input
                    type="text"
                    inputMode="decimal"
                    value={discountType === "price" ? discountPrice : discountPercent}
                    onChange={(e) => {
                      if (discountType === "price") {
                        handleDiscountPriceChange(e.target.value);
                      } else {
                        handleDiscountPercentChange(e.target.value);
                      }
                    }}
                    placeholder={discountType === "price" ? "0.00 ₹" : "0 %"}
                    className={`w-full ${
                      discountType === "price" ? "pl-7 pr-3" : "pl-3 pr-7"
                    } py-2 text-xs font-bold rounded-xl border border-[var(--border-color)] bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-amber-600 dark:text-amber-400`}
                  />
                  {discountType === "percent" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Effective Rate Preview Card */}
            {numericPrice > 0 && (
              <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Base Price:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    ₹{numericPrice.toLocaleString("en-IN")} / {unit}
                  </span>
                  {(discountPercent > 0 || discountPrice > 0) && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {discountType === "percent" ? `${discountPercent}% OFF` : `Disc: ₹${discountPrice}`}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 font-black text-emerald-700 dark:text-emerald-400">
                  <span>Effective:</span>
                  <span className="text-sm">
                    ₹{effectivePrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {unit}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveAndAddAnother}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Plus size={14} /> Save & Add Another
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-[#C9A227] hover:bg-[#B8911F] text-white text-xs font-black rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5"
            >
              <Check size={15} /> Save to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
