import React, { useState, useEffect } from "react";
import { X, Check, Tag, Layers, FolderTree, FileText, Plus } from "lucide-react";
import SectionInput from "./SectionInput";
import ComboboxSelect from "./ComboboxSelect";

export default function QuotationItemModal({
  isOpen,
  onClose,
  onSave,
  editingItem = null,
  productsList = [],
  categoriesList = [],
  specificationsList = [],
  sectionSuggestions = [],
}) {
  const [section, setSection] = useState("");
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [specification, setSpecification] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("Sq.Ft");
  const [rate, setRate] = useState("");
  const [discountType, setDiscountType] = useState("percent"); // 'percent' | 'price'
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");

  const cleanProductsList = React.useMemo(() => {
    return (productsList || []).filter(
      p => p && typeof p === "string" && !p.toLowerCase().includes("product / category")
    );
  }, [productsList]);

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setSection(editingItem.section || "");
        setProduct(editingItem.product || "");
        setCategory(editingItem.category || "");
        setSpecification(editingItem.specification || "");
        setQty(editingItem.qty !== undefined && editingItem.qty !== null ? String(editingItem.qty) : "");
        setUnit(editingItem.unit || "Sq.Ft");
        setRate(editingItem.rate !== undefined && editingItem.rate !== null ? String(editingItem.rate) : "");
        setDiscountType(editingItem.discountType || "percent");
        setDiscountPercent(editingItem.discountPercent || "");
        setDiscountPrice(editingItem.discountPrice || "");
      } else {
        setSection("");
        setProduct("");
        setCategory("");
        setSpecification("");
        setQty("");
        setUnit("Sq.Ft");
        setRate("");
        setDiscountType("percent");
        setDiscountPercent("");
        setDiscountPrice("");
      }
    }
  }, [isOpen, editingItem]);

  if (!isOpen) return null;

  // Real-time calculation
  const numericQty = parseFloat(qty) || 0;
  const numericRate = parseFloat(rate) || 0;
  let effectiveRate = numericRate;

  if (discountType === "percent" && discountPercent) {
    const p = parseFloat(discountPercent) || 0;
    effectiveRate = Math.max(0, numericRate - (numericRate * p) / 100);
  } else if (discountType === "price" && discountPrice) {
    const dp = parseFloat(discountPrice) || 0;
    effectiveRate = Math.max(0, dp);
  }

  const itemAmount = numericQty * effectiveRate;

  const handleRateChange = (val) => {
    const clean = val.replace(/[^0-9.]/g, "");
    setRate(clean);
    const numR = parseFloat(clean) || 0;
    if (discountType === "percent" && discountPercent && numR > 0) {
      const p = parseFloat(discountPercent) || 0;
      const dp = numR - (numR * p) / 100;
      setDiscountPrice(dp > 0 ? dp.toFixed(2) : "0");
    } else if (discountType === "price" && discountPrice && numR > 0) {
      const dp = parseFloat(discountPrice) || 0;
      const p = (((numR - dp) / numR) * 100).toFixed(1);
      setDiscountPercent(p > 0 ? p : "0");
    }
  };

  const handleDiscountPercentChange = (val) => {
    const clean = val.replace(/[^0-9.]/g, "");
    setDiscountPercent(clean);
    const numR = parseFloat(rate) || 0;
    if (clean && parseFloat(clean) > 0 && numR > 0) {
      const p = parseFloat(clean);
      const dp = numR - (numR * p) / 100;
      setDiscountPrice(dp > 0 ? dp.toFixed(2) : "0");
    } else {
      setDiscountPrice("");
    }
  };

  const handleDiscountPriceChange = (val) => {
    const clean = val.replace(/[^0-9.]/g, "");
    setDiscountPrice(clean);
    const numR = parseFloat(rate) || 0;
    if (clean && parseFloat(clean) > 0 && numR > 0) {
      const dp = parseFloat(clean);
      const p = (((numR - dp) / numR) * 100).toFixed(1);
      setDiscountPercent(p > 0 ? p : "0");
    } else {
      setDiscountPercent("");
    }
  };

  const handleToggleDiscountType = () => {
    const newType = discountType === "percent" ? "price" : "percent";
    setDiscountType(newType);
  };

  const constructItem = () => {
    if (!product && !specification) {
      alert("Please enter or select at least a Product or Specification.");
      return null;
    }

    return {
      id: editingItem ? editingItem.id : Date.now() + Math.random(),
      code: editingItem?.code || "",
      section: section.trim(),
      product: product.trim(),
      category: category.trim(),
      specification: specification.trim(),
      qty: qty || "0",
      unit: unit || "Sq.Ft",
      rate: rate || "0",
      discountType,
      discountPercent,
      discountPrice,
      amount: itemAmount
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const item = constructItem();
    if (!item) return;
    onSave(item);
    onClose();
  };

  const handleSaveAndAddAnother = (e) => {
    e.preventDefault();
    const item = constructItem();
    if (!item) return;
    onSave(item);
    // Keep section/area for quick continuous adding in the same area, but reset product inputs
    setProduct("");
    setCategory("");
    setSpecification("");
    setQty("");
    setRate("");
    setDiscountPercent("");
    setDiscountPrice("");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header matching project secondary gold color */}
        <div className="bg-gradient-to-r from-[#B8911F] via-[#C9A227] to-[#D4AF37] px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide uppercase">
                {editingItem ? "Edit Quotation Item" : "Add Quotation Item"}
              </h3>
              <p className="text-[11px] text-amber-100 font-medium">
                Enter item details, material specifications, and rates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Section / Area */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
              <Tag size={12} /> Section / Area
            </label>
            <SectionInput
              value={section}
              onChange={(val) => setSection(val)}
              suggestions={sectionSuggestions}
              placeholder="e.g. Living Room, Master Bedroom, Kitchen"
            />
          </div>

          {/* Row 2: Product */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
              <Layers size={12} /> Product <span className="text-red-500">*</span>
            </label>
            <ComboboxSelect
              value={product}
              onChange={(val) => setProduct(val)}
              options={cleanProductsList}
              placeholder="Search or select product (e.g. Wardrobe, Kitchen Cabinets)..."
              required
            />
          </div>

          {/* Row 3: Category (between Product and Specification) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
              <FolderTree size={12} /> Category
            </label>
            <ComboboxSelect
              value={category}
              onChange={(val) => setCategory(val)}
              options={categoriesList}
              placeholder="Search or select category (e.g. Carcass, Shutters, Hardware, Accessories)..."
            />
          </div>

          {/* Row 4: Specification & Material Details */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
              <FileText size={12} /> Specification & Material
            </label>
            <ComboboxSelect
              value={specification}
              onChange={(val) => setSpecification(val)}
              options={specificationsList}
              placeholder="Search or select specification (e.g. 18mm BWR Ply with Laminate)..."
            />
          </div>

          {/* Row 4: Quantity, Unit, Rate, Discount */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={qty}
                onChange={(e) => setQty(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0"
                className="w-full themed-input border border-[var(--border-color)] px-3 py-2 rounded-xl text-sm font-black text-center outline-none focus:border-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full themed-input border border-[var(--border-color)] px-3 py-2 rounded-xl text-sm font-bold text-center outline-none focus:border-[#C9A227] cursor-pointer [&>option]:bg-[var(--bg-surface)]"
              >
                <option>Sq.Ft</option>
                <option>L.Ft</option>
                <option>Nos</option>
                <option>Pcs</option>
                <option>Set</option>
                <option>LS</option>
                <option>Rmt</option>
                <option>Sq.Mt</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Unit Rate (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={rate}
                onChange={(e) => handleRateChange(e.target.value)}
                placeholder="0.00"
                className="w-full themed-input border border-[var(--border-color)] px-3 py-2 rounded-xl text-sm font-black text-right outline-none focus:border-[#C9A227]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Disc ({discountType === "price" ? "₹" : "%"})
                </label>
                <button
                  type="button"
                  onClick={handleToggleDiscountType}
                  className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-[var(--accent)] border border-amber-500/30 hover:bg-amber-500/20 transition"
                  title="Switch between Percentage and Direct Price discount"
                >
                  {discountType === "price" ? "Switch to %" : "Switch to ₹"}
                </button>
              </div>
              <input
                type="text"
                value={discountType === "price" ? discountPrice : discountPercent}
                onChange={(e) => {
                  if (discountType === "price") {
                    handleDiscountPriceChange(e.target.value);
                  } else {
                    handleDiscountPercentChange(e.target.value);
                  }
                }}
                placeholder={discountType === "price" ? "0.00 ₹" : "0 %"}
                className="w-full themed-input border border-[var(--border-color)] px-3 py-2 rounded-xl text-sm font-semibold text-right outline-none focus:border-[#C9A227]"
              />
            </div>
          </div>

          {/* Real-time Calculation Summary Box */}
          <div className="bg-gradient-to-r from-amber-50/80 via-yellow-50/40 to-slate-50/70 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-slate-900/40 border border-amber-200/80 dark:border-amber-700/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-semibold text-slate-500">Effective Rate:</span>{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ₹{effectiveRate.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {unit}
                </span>
              </div>
              {numericQty > 0 && numericRate > 0 && (
                <div className="text-[11px] text-slate-400">
                  Calculation: {numericQty} {unit} × ₹{effectiveRate.toFixed(2)}
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="block text-[10px] font-extrabold uppercase text-amber-700 dark:text-[var(--accent)] tracking-wider">
                Total Line Amount
              </span>
              <span className="text-2xl font-black text-amber-700 dark:text-[var(--accent)] tracking-tight">
                ₹{itemAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[var(--border-color)] flex flex-wrap justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              Cancel
            </button>
            {!editingItem && (
              <button
                type="button"
                onClick={handleSaveAndAddAnother}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 active:scale-95 transition flex items-center gap-1.5"
                title="Add this item and stay in modal to add another"
              >
                <Plus size={15} strokeWidth={2.5} /> Save & Add Another
              </button>
            )}
            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl text-sm font-black text-white bg-[#C9A227] hover:bg-[#B8911F] active:scale-95 transition shadow-lg shadow-amber-900/20 flex items-center gap-2"
            >
              <Check size={16} strokeWidth={3} />
              {editingItem ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
