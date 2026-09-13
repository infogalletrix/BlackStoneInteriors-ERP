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
  Sparkles,
  FolderTree,
  DollarSign,
  ChevronRight,
  ArrowRight,
  Info,
  Tag,
  Hash,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useDialog } from "../contexts/DialogContext";
import { useThemeClasses } from "../hooks/useThemeClasses";
import CatalogItemModal from "../components/CatalogItemModal";

export const STANDARD_UNITS = [
  "Sq.Ft",
  "R.Ft",
  "Nos",
  "Sets",
  "L.S",
  "R.Mtr",
  "Sq.Mtr"
];

export const PRESET_CATEGORIES = [
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

export const INITIAL_DEFAULT_TREE = [
  {
    id: "prod-1",
    name: "Kitchen Cabinets",
    categories: [
      {
        id: "cat-1-1",
        name: "Carcass / Core Structure",
        specifications: [
          { id: "spec-1-1-1", name: "18mm BWP Marine Ply with 0.8mm White Internal Laminate", unitPrice: 1850, unit: "Sq.Ft" },
          { id: "spec-1-1-2", name: "HDHMR Board with 0.8mm Internal Balancer", unitPrice: 1650, unit: "Sq.Ft" },
          { id: "spec-1-1-3", name: "Commercial Plywood with 0.8mm Mica Finish", unitPrice: 1450, unit: "Sq.Ft" }
        ]
      },
      {
        id: "cat-1-2",
        name: "Shutters & Fascia",
        specifications: [
          { id: "spec-1-2-1", name: "Acrylic Finish (2mm) on HDHMR with Edge Banding", unitPrice: 2350, unit: "Sq.Ft" },
          { id: "spec-1-2-2", name: "PU Matte / Gloss Paint Finish on CNC HDHMR", unitPrice: 2600, unit: "Sq.Ft" },
          { id: "spec-1-2-3", name: "Tinted Glass Shutter with 45mm Aluminum Profile", unitPrice: 2800, unit: "Sq.Ft" },
          { id: "spec-1-2-4", name: "1mm High Gloss Laminate with 2mm PVC Edgeband", unitPrice: 1950, unit: "Sq.Ft" }
        ]
      },
      {
        id: "cat-1-3",
        name: "Hardware & Hinges",
        specifications: [
          { id: "spec-1-3-1", name: "Hettich Soft-Close Hinges (Sensys 110 Degree)", unitPrice: 420, unit: "Nos" },
          { id: "spec-1-3-2", name: "Hafele Metalla Soft-Close Concealed Hinges", unitPrice: 380, unit: "Nos" }
        ]
      },
      {
        id: "cat-1-4",
        name: "Drawers & Runners",
        specifications: [
          { id: "spec-1-4-1", name: "Hettich Innotech Soft-Close Drawer System (900mm)", unitPrice: 3400, unit: "Sets" },
          { id: "spec-1-4-2", name: "Hafele Matrix Box Drawer Runner with Soft Close", unitPrice: 3100, unit: "Sets" },
          { id: "spec-1-4-3", name: "Telescopic Soft-Close Channels (20 Inch / Heavy Duty)", unitPrice: 950, unit: "Sets" }
        ]
      },
      {
        id: "cat-1-5",
        name: "Countertop & Splashback",
        specifications: [
          { id: "spec-1-5-1", name: "Quartz Stone Countertop with Edge Chamfering", unitPrice: 480, unit: "R.Ft" },
          { id: "spec-1-5-2", name: "Nano White Engineered Marble Countertop", unitPrice: 550, unit: "R.Ft" }
        ]
      },
      {
        id: "cat-1-6",
        name: "Internal Accessories & Wirework",
        specifications: [
          { id: "spec-1-6-1", name: "Higold SS304 Matt Black 2-Tier Bottle Pullout (300mm)", unitPrice: 4500, unit: "Nos" },
          { id: "spec-1-6-2", name: "PVC Cutlery Organizer Tray - 900mm", unitPrice: 1800, unit: "Nos" }
        ]
      }
    ]
  },
  {
    id: "prod-2",
    name: "Wardrobe",
    categories: [
      {
        id: "cat-2-1",
        name: "Carcass / Core Structure",
        specifications: [
          { id: "spec-2-1-1", name: "18mm BWP Marine Ply with 0.8mm Fabric Texture Laminate", unitPrice: 1750, unit: "Sq.Ft" },
          { id: "spec-2-1-2", name: "Commercial Plywood with 0.8mm Internal Mica", unitPrice: 1400, unit: "Sq.Ft" }
        ]
      },
      {
        id: "cat-2-2",
        name: "Shutters & Fascia",
        specifications: [
          { id: "spec-2-2-1", name: "Sliding Shutters with Heavy Duty Aluminum Track System", unitPrice: 2450, unit: "Sq.Ft" },
          { id: "spec-2-2-2", name: "Hinged Full-Height Shutters with Gold Profile Handles", unitPrice: 2100, unit: "Sq.Ft" },
          { id: "spec-2-2-3", name: "Tinted Fluted Glass in Slim Aluminum Frame", unitPrice: 2900, unit: "Sq.Ft" },
          { id: "spec-2-2-4", name: "Natural Teak Veneer with Melamine Matte Polish", unitPrice: 2750, unit: "Sq.Ft" }
        ]
      },
      {
        id: "cat-2-3",
        name: "Internal Accessories & Wirework",
        specifications: [
          { id: "spec-2-3-1", name: "Pull-out Trouser & Tie Rack", unitPrice: 3800, unit: "Nos" },
          { id: "spec-2-3-2", name: "Built-in Profile Light with Motion Sensor & Driver", unitPrice: 350, unit: "R.Ft" },
          { id: "spec-2-3-3", name: "Jewelry & Valuables Soft Velvet Drawer", unitPrice: 2800, unit: "Nos" }
        ]
      }
    ]
  },
  {
    id: "prod-3",
    name: "TV Unit",
    categories: [
      {
        id: "cat-3-1",
        name: "Paneling & Framing",
        specifications: [
          { id: "spec-3-1-1", name: "Fluted Charcoal Louver Paneling with Brass Inlay", unitPrice: 650, unit: "Sq.Ft" },
          { id: "spec-3-1-2", name: "Natural Teak Veneer Wall Paneling with PU Finish", unitPrice: 850, unit: "Sq.Ft" },
          { id: "spec-3-1-3", name: "Large Format Tile Cladding on Plywood Backing", unitPrice: 1200, unit: "Sq.Ft" }
        ]
      },
      {
        id: "cat-3-2",
        name: "Drawers & Runners",
        specifications: [
          { id: "spec-3-2-1", name: "Floating Console with Soft-Close Drawers & Chamfered Edge", unitPrice: 1650, unit: "R.Ft" },
          { id: "spec-3-2-2", name: "CNC Geometric Grooving on HDHMR with PU Polish", unitPrice: 1950, unit: "R.Ft" }
        ]
      }
    ]
  },
  {
    id: "prod-4",
    name: "False Ceiling",
    categories: [
      {
        id: "cat-4-1",
        name: "Carcass / Core Structure",
        specifications: [
          { id: "spec-4-1-1", name: "Gyproc Saint-Gobain Gypsum Board Ceiling with GI Framing", unitPrice: 135, unit: "Sq.Ft" },
          { id: "spec-4-1-2", name: "POP Punning with Designer Grooving", unitPrice: 85, unit: "Sq.Ft" }
        ]
      },
      {
        id: "cat-4-2",
        name: "Cove & Accent Lighting",
        specifications: [
          { id: "spec-4-2-1", name: "Indirect Perimeter Cove with Concealed Profile Channel", unitPrice: 180, unit: "R.Ft" },
          { id: "spec-4-2-2", name: "Wooden Rafter Ceiling Detail with Melamine Polish", unitPrice: 450, unit: "R.Ft" }
        ]
      }
    ]
  },
  {
    id: "prod-5",
    name: "Shoe Rack",
    categories: [
      {
        id: "cat-5-1",
        name: "Carcass / Core Structure",
        specifications: [
          { id: "spec-5-1-1", name: "Commercial Plywood with Louvered Ventilation Shutters", unitPrice: 1600, unit: "Sq.Ft" },
          { id: "spec-5-1-2", name: "Cushioned Top Seating Bench with Drawer Storage", unitPrice: 1850, unit: "R.Ft" }
        ]
      }
    ]
  },
  {
    id: "prod-6",
    name: "Study Table & Bookshelf",
    categories: [
      {
        id: "cat-6-1",
        name: "Carcass / Core Structure",
        specifications: [
          { id: "spec-6-1-1", name: "Plywood Study Desktop with Wire Grommet & Soft-Close Drawers", unitPrice: 1850, unit: "R.Ft" },
          { id: "spec-6-1-2", name: "Overhead Open Display Bookshelf with Built-in Light", unitPrice: 1550, unit: "Sq.Ft" }
        ]
      }
    ]
  },
  {
    id: "prod-7",
    name: "Pooja Unit",
    categories: [
      {
        id: "cat-7-1",
        name: "Finishing & Detailing",
        specifications: [
          { id: "spec-7-1-1", name: "Solid Teak Wood Jali Cutting with CNC Detailing & Bell Inlay", unitPrice: 1450, unit: "Sq.Ft" },
          { id: "spec-7-1-2", name: "Backlit Onyx Marble Panel with LED Warm Illumination", unitPrice: 2200, unit: "Sq.Ft" }
        ]
      }
    ]
  },
  {
    id: "prod-8",
    name: "Vanity Cabinet",
    categories: [
      {
        id: "cat-8-1",
        name: "Carcass / Core Structure",
        specifications: [
          { id: "spec-8-1-1", name: "100% Water-Resistant PVC / Foam Board with Acrylic Finish", unitPrice: 2100, unit: "Sq.Ft" },
          { id: "spec-8-1-2", name: "LED Backlit Touch Sensor Mirror (Custom Size)", unitPrice: 4500, unit: "Nos" }
        ]
      }
    ]
  },
  {
    id: "prod-9",
    name: "Bed with Storage",
    categories: [
      {
        id: "cat-9-1",
        name: "Carcass / Core Structure",
        specifications: [
          { id: "spec-9-1-1", name: "Hydraulic Lift-up Bed Frame with Heavy Duty Gas Struts (King Size)", unitPrice: 48000, unit: "Nos" },
          { id: "spec-9-1-2", name: "Drawer Storage Bed with 18mm Plywood Structure", unitPrice: 38000, unit: "Nos" }
        ]
      },
      {
        id: "cat-9-2",
        name: "Cushioning & Upholstery",
        specifications: [
          { id: "spec-9-2-1", name: "Full-Height Fluted Headboard in Velvet / Suede Upholstery", unitPrice: 650, unit: "Sq.Ft" },
          { id: "spec-9-2-2", name: "Geometric Diamond Tufted Headboard Cushioning", unitPrice: 750, unit: "Sq.Ft" }
        ]
      }
    ]
  }
];

export const DEFAULT_PRODUCTS = INITIAL_DEFAULT_TREE.map(p => p.name);
export const DEFAULT_CATEGORIES = PRESET_CATEGORIES;
export const DEFAULT_SPECIFICATIONS = INITIAL_DEFAULT_TREE.flatMap(p => 
  p.categories.flatMap(c => c.specifications.map(s => s.name))
);

export default function CatalogPage() {
  const { showDialog } = useDialog();
  const t = useThemeClasses();

  const [catalogTree, setCatalogTree] = useState(() => {
    try {
      const saved = localStorage.getItem("quote_catalog_tree");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_DEFAULT_TREE;
  });

  // Selected hierarchy state
  const [selectedProductId, setSelectedProductId] = useState(() => INITIAL_DEFAULT_TREE[0]?.id || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSpecId, setSelectedSpecId] = useState("");

  // Modal states for adding new catalog items
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialProduct, setAddModalInitialProduct] = useState("");
  const [addModalInitialCategory, setAddModalInitialCategory] = useState("");

  const handleOpenAddModal = ({ product = "", category = "" } = {}) => {
    setAddModalInitialProduct(product || activeProduct?.name || "");
    setAddModalInitialCategory(category || (product ? activeCategory?.name || "" : ""));
    setIsAddModalOpen(true);
  };

  // Editing modal/inline states
  const [editingItem, setEditingItem] = useState(null); // { type: 'product'|'category'|'spec', id, name, unitPrice, unit }

  // Global search query
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Load from backend on mount
  useEffect(() => {
    fetch("/api/catalog")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data.tree) && data.tree.length > 0) {
          setCatalogTree(data.tree);
          localStorage.setItem("quote_catalog_tree", JSON.stringify(data.tree));
        }
      })
      .catch(err => console.error("Failed to load catalog tree:", err));
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("quote_catalog_tree", JSON.stringify(catalogTree));
      // Also sync flat arrays for legacy compatibility
      const flatProducts = catalogTree.map(p => p.name).filter(Boolean);
      const flatCategories = Array.from(new Set(catalogTree.flatMap(p => (p.categories || []).map(c => c.name)).filter(Boolean)));
      const flatSpecs = Array.from(new Set(catalogTree.flatMap(p => (p.categories || []).flatMap(c => (c.specifications || []).map(s => s.name))).filter(Boolean)));
      localStorage.setItem("quote_products", JSON.stringify(flatProducts));
      localStorage.setItem("quote_categories", JSON.stringify(flatCategories));
      localStorage.setItem("quote_specifications", JSON.stringify(flatSpecs));
    } catch (e) {
      console.error("Local sync error:", e);
    }
  }, [catalogTree]);

  // Persist to backend helper
  const persistToServer = async (newTree) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tree: newTree })
      });
      if (res.ok) {
        setSaveSuccessMsg("Saved to cloud");
        setTimeout(() => setSaveSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.warn("Failed to persist catalog to server:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Derive active selected items
  const activeProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return catalogTree.find(p => p.id === selectedProductId) || null;
  }, [catalogTree, selectedProductId]);

  const activeCategory = useMemo(() => {
    if (!activeProduct || !activeProduct.categories || !selectedCategoryId) return null;
    return activeProduct.categories.find(c => c.id === selectedCategoryId) || null;
  }, [activeProduct, selectedCategoryId]);

  const activeSpec = useMemo(() => {
    if (!activeCategory || !activeCategory.specifications || !selectedSpecId) return null;
    return activeCategory.specifications.find(s => s.id === selectedSpecId) || null;
  }, [activeCategory, selectedSpecId]);

  // Clean up selected category if it no longer exists under active product
  useEffect(() => {
    if (selectedCategoryId) {
      const exists = activeProduct?.categories?.some(c => c.id === selectedCategoryId);
      if (!exists) {
        setSelectedCategoryId("");
      }
    }
  }, [activeProduct, selectedCategoryId]);

  // Clean up selected specification if it no longer exists under active category
  useEffect(() => {
    if (selectedSpecId) {
      const exists = activeCategory?.specifications?.some(s => s.id === selectedSpecId);
      if (!exists) {
        setSelectedSpecId("");
      }
    }
  }, [activeCategory, selectedSpecId]);

  // ── SAVE CATALOG ITEM (FROM UNIFIED MODAL) ────────────────────
  const handleSaveCatalogItem = (itemData) => {
    const {
      product,
      category,
      specification,
      unitPrice,
      unit,
      discountType,
      discountPercent,
      discountPrice
    } = itemData;

    let updated = [...catalogTree];

    // 1. Find or create Product
    let prodIdx = updated.findIndex(
      (p) => p.name.trim().toLowerCase() === product.trim().toLowerCase()
    );
    let prodId;
    if (prodIdx === -1) {
      const newProd = {
        id: "prod-" + Date.now(),
        name: product.trim(),
        categories: []
      };
      updated.push(newProd);
      prodIdx = updated.length - 1;
    }
    prodId = updated[prodIdx].id;

    const trimmedCat = (category || "").trim();
    let catId = "";

    // 2. Only find or create Category under this Product if category is provided!
    if (trimmedCat) {
      let prodCategories = [...(updated[prodIdx].categories || [])];
      let catIdx = prodCategories.findIndex(
        (c) => c.name.trim().toLowerCase() === trimmedCat.toLowerCase()
      );
      if (catIdx === -1) {
        const newCat = {
          id: "cat-" + Date.now() + Math.floor(Math.random() * 1000),
          name: trimmedCat,
          specifications: []
        };
        prodCategories.push(newCat);
        catIdx = prodCategories.length - 1;
      }
      catId = prodCategories[catIdx].id;

      // 3. If specification & unit price provided, add or update specification under this category
      if (specification && specification.trim() && unitPrice !== null && !isNaN(unitPrice) && Number(unitPrice) > 0) {
        const newSpec = {
          id: "spec-" + Date.now() + Math.floor(Math.random() * 1000),
          name: specification.trim(),
          unitPrice: Number(unitPrice),
          unit: unit || "Sq.Ft",
          discountType: discountType || "percent",
          discountPercent: discountPercent !== null && discountPercent !== undefined ? Number(discountPercent) : null,
          discountPrice: discountPrice !== null && discountPrice !== undefined ? Number(discountPrice) : null
        };

        const existingSpecs = [...(prodCategories[catIdx].specifications || [])];
        const specIdx = existingSpecs.findIndex(
          (s) => s.name.trim().toLowerCase() === specification.trim().toLowerCase()
        );
        if (specIdx >= 0) {
          existingSpecs[specIdx] = { ...existingSpecs[specIdx], ...newSpec, id: existingSpecs[specIdx].id };
        } else {
          existingSpecs.push(newSpec);
        }
        prodCategories[catIdx] = {
          ...prodCategories[catIdx],
          specifications: existingSpecs
        };
      }

      updated[prodIdx] = {
        ...updated[prodIdx],
        categories: prodCategories
      };
    }

    setCatalogTree(updated);
    setSelectedProductId(prodId);
    if (catId) {
      setSelectedCategoryId(catId);
    } else if (updated[prodIdx].categories && updated[prodIdx].categories.length > 0) {
      setSelectedCategoryId(updated[prodIdx].categories[0].id);
    } else {
      setSelectedCategoryId("");
    }
    persistToServer(updated);
  };

  // ── PRODUCT ACTIONS ──────────────────────────────────────────
  const handleDeleteProduct = (prodId, prodName) => {
    showDialog({
      title: "Delete Product",
      message: `Are you sure you want to delete "${prodName}" and all its categories and specifications?`,
      type: "confirm",
      onConfirm: () => {
        const updated = catalogTree.filter(p => p.id !== prodId);
        setCatalogTree(updated);
        if (selectedProductId === prodId) {
          const next = updated[0];
          setSelectedProductId(next ? next.id : "");
          setSelectedCategoryId("");
          setSelectedSpecId("");
        }
        persistToServer(updated);
      }
    });
  };

  // ── CATEGORY ACTIONS ─────────────────────────────────────────
  const handleDeleteCategory = (catId, catName) => {
    showDialog({
      title: "Delete Category",
      message: `Are you sure you want to remove "${catName}" from ${activeProduct?.name || "this product"}?`,
      type: "confirm",
      onConfirm: () => {
        const updated = catalogTree.map(p => {
          if (activeProduct && p.id === activeProduct.id) {
            return {
              ...p,
              categories: (p.categories || []).filter(c => c.id !== catId)
            };
          }
          return p;
        });
        setCatalogTree(updated);
        if (selectedCategoryId === catId) {
          setSelectedCategoryId("");
          setSelectedSpecId("");
        }
        persistToServer(updated);
      }
    });
  };

  // ── SPECIFICATION ACTIONS ────────────────────────────────────

  const handleDeleteSpecification = (specId, specName) => {
    showDialog({
      title: "Delete Specification",
      message: `Delete "${specName}"?`,
      type: "confirm",
      onConfirm: () => {
        const updated = catalogTree.map(p => {
          if (activeProduct && p.id === activeProduct.id) {
            return {
              ...p,
              categories: (p.categories || []).map(c => {
                if (activeCategory && c.id === activeCategory.id) {
                  return {
                    ...c,
                    specifications: (c.specifications || []).filter(s => s.id !== specId)
                  };
                }
                return c;
              })
            };
          }
          return p;
        });
        setCatalogTree(updated);
        if (selectedSpecId === specId) {
          setSelectedSpecId("");
        }
        persistToServer(updated);
      }
    });
  };

  // ── EDIT ITEM SAVE ───────────────────────────────────────────
  const handleSaveEdit = () => {
    if (!editingItem) return;
    const { type, id, name, unitPrice, unit } = editingItem;
    if (!name.trim()) return;

    let updated = [...catalogTree];
    if (type === "product") {
      updated = updated.map(p => p.id === id ? { ...p, name: name.trim() } : p);
    } else if (type === "category") {
      updated = updated.map(p => {
        if (p.id === activeProduct?.id) {
          return {
            ...p,
            categories: (p.categories || []).map(c => c.id === id ? { ...c, name: name.trim() } : c)
          };
        }
        return p;
      });
    } else if (type === "specification") {
      const parsedPrice = parseFloat(unitPrice);
      if (!unitPrice || isNaN(parsedPrice) || parsedPrice <= 0) {
        showDialog({ title: "Unit Price Required", message: "Unit price is mandatory and must be greater than 0.", type: "alert" });
        return;
      }

      updated = updated.map(p => {
        if (p.id === activeProduct?.id) {
          return {
            ...p,
            categories: (p.categories || []).map(c => {
              if (c.id === activeCategory?.id) {
                return {
                  ...c,
                  specifications: (c.specifications || []).map(s => 
                    s.id === id ? { 
                      ...s, 
                      name: name.trim(), 
                      unitPrice: parsedPrice, 
                      unit: unit || "Sq.Ft",
                      discountType: editingItem.discountType || "percent",
                      discountPercent: editingItem.discountPercent !== undefined && editingItem.discountPercent !== "" && !isNaN(parseFloat(editingItem.discountPercent)) ? parseFloat(editingItem.discountPercent) : null,
                      discountPrice: editingItem.discountPrice !== undefined && editingItem.discountPrice !== "" && !isNaN(parseFloat(editingItem.discountPrice)) ? parseFloat(editingItem.discountPrice) : null
                    } : s
                  )
                };
              }
              return c;
            })
          };
        }
        return p;
      });
    }

    setCatalogTree(updated);
    setEditingItem(null);
    persistToServer(updated);
  };

  // Filtered products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return catalogTree;
    const q = searchQuery.toLowerCase();
    return catalogTree.filter(p => {
      const matchProd = p.name.toLowerCase().includes(q);
      const matchCat = (p.categories || []).some(c => 
        c.name.toLowerCase().includes(q) || 
        (c.specifications || []).some(s => s.name.toLowerCase().includes(q))
      );
      return matchProd || matchCat;
    });
  }, [catalogTree, searchQuery]);

  return (
    <div className={`p-3 md:p-5 space-y-3.5 w-full max-w-none ${t.text}`}>
      {/* ── HEADER BANNER (Compact) ── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#B8911F] via-[#C9A227] to-[#D4AF37] border border-amber-400/40 px-5 py-2.5 shadow-md text-white">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <Package className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Master Catalog Management
              </h1>
              <p className="text-[11px] text-amber-50/95 font-medium">
                Product → Category → Specification with Unit Price & Discounts. Auto-fills quotations!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {saveSuccessMsg && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 text-white text-xs font-bold border border-white/30 backdrop-blur-sm">
                <CheckCircle2 size={13} /> {saveSuccessMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── SEARCH & BREADCRUMBS BAR ── */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-bold overflow-x-auto w-full md:w-auto">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Package size={15} /> All Products ({catalogTree.length})
          </span>
          <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
          <span className={`px-2.5 py-1 rounded-lg border flex-shrink-0 transition-all ${
            activeProduct
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent"
          }`}>
            {activeProduct ? activeProduct.name : "Select Product"}
          </span>
          <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
          <span className={`px-2.5 py-1 rounded-lg border flex-shrink-0 transition-all ${
            activeCategory
              ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent"
          }`}>
            {activeCategory ? activeCategory.name : "Select Category"}
          </span>
          {activeSpec && (
            <>
              <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex-shrink-0 truncate max-w-[200px]">
                {activeSpec.name}
              </span>
            </>
          )}
        </div>

        {/* Global Search & Add Item Button */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          <div className="relative flex-1 md:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, specs..."
              className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleOpenAddModal({ product: activeProduct?.name || "", category: activeCategory?.name || "" })}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C9A227] hover:bg-[#B8911F] text-white rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} /> Add Item
          </button>
        </div>
      </div>

      {/* ── 3-COLUMN CASCADING EXPLORER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── COLUMN 1: PRODUCTS (Level 1) ── */}
        <div className="lg:col-span-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-100/70 dark:bg-slate-800/60 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#C9A227] text-white flex items-center justify-center text-xs font-black">
                1
              </span>
              <h2 className="text-sm font-black uppercase tracking-wider text-themed flex items-center gap-1.5">
                <Package size={15} className="text-[#C9A227]" /> Products
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {filteredProducts.length}
              </span>
              <button
                type="button"
                onClick={() => handleOpenAddModal({ product: "", category: "" })}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#C9A227] hover:bg-[#B8911F] text-white rounded-lg text-xs font-bold shadow-xs hover:shadow transition cursor-pointer"
                title="Add New Product"
              >
                <Plus size={12} strokeWidth={2.5} /> Add
              </button>
            </div>
          </div>

          {/* Product Items List */}
          <div className="divide-y divide-[var(--border-color)] max-h-[640px] overflow-y-auto">
            {filteredProducts.map((prod) => {
              const isSelected = prod.id === selectedProductId;
              const totalCats = (prod.categories || []).length;
              const totalSpecs = (prod.categories || []).reduce((sum, c) => sum + (c.specifications || []).length, 0);

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    if (selectedProductId === prod.id) {
                      setSelectedProductId("");
                      setSelectedCategoryId("");
                      setSelectedSpecId("");
                    } else {
                      setSelectedProductId(prod.id);
                      setSelectedCategoryId("");
                      setSelectedSpecId("");
                    }
                  }}
                  className={`group p-3 flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "bg-amber-500/10 border-l-4 border-l-[#C9A227] shadow-inner font-bold"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${isSelected ? "text-amber-800 dark:text-amber-300 font-black" : "text-themed font-semibold"}`}>
                        {prod.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted">
                      <span>{totalCats} {totalCats === 1 ? "category" : "categories"}</span>
                      <span>•</span>
                      <span>{totalSpecs} specs</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem({ type: "product", id: prod.id, name: prod.name });
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      title="Rename Product"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(prod.id, prod.name);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition"
                      title="Delete Product"
                    >
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={14} className={`ml-1 transition ${isSelected ? "text-amber-600 translate-x-0.5" : "text-slate-300 opacity-0 group-hover:opacity-100"}`} />
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-muted text-xs font-semibold">
                No products found matching "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* ── COLUMN 2: CATEGORIES (Level 2) ── */}
        <div className="lg:col-span-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-100/70 dark:bg-slate-800/60 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-black">
                2
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-wider text-themed flex items-center gap-1.5 truncate">
                  <FolderTree size={15} className="text-teal-600" /> Categories
                </h2>
                {activeProduct ? (
                  <p className="text-[10px] text-muted truncate">
                    under <strong className="text-themed">{activeProduct.name}</strong>
                  </p>
                ) : (
                  <p className="text-[10px] text-muted truncate">
                    No product selected
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {activeProduct ? (activeProduct.categories || []).length : 0}
              </span>
              <button
                type="button"
                onClick={() => handleOpenAddModal({ product: activeProduct?.name || "", category: "" })}
                className="flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow transition cursor-pointer"
                title="Add Category to this Product"
              >
                <Plus size={12} strokeWidth={2.5} /> Add
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="divide-y divide-[var(--border-color)] max-h-[640px] overflow-y-auto">
            {activeProduct && (activeProduct.categories || []).map((cat) => {
              const isSelected = cat.id === selectedCategoryId;
              const specCount = (cat.specifications || []).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    if (selectedCategoryId === cat.id) {
                      setSelectedCategoryId("");
                      setSelectedSpecId("");
                    } else {
                      setSelectedCategoryId(cat.id);
                      setSelectedSpecId("");
                    }
                  }}
                  className={`group p-3 flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "bg-teal-500/10 border-l-4 border-l-teal-600 shadow-inner font-bold"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className={`text-xs md:text-sm truncate block ${isSelected ? "text-teal-800 dark:text-teal-300 font-black" : "text-themed font-semibold"}`}>
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-muted">
                      {specCount} {specCount === 1 ? "specification" : "specifications"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem({ type: "category", id: cat.id, name: cat.name });
                      }}
                      className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      title="Rename Category"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.id, cat.name);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition"
                      title="Delete Category"
                    >
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={14} className={`ml-1 transition ${isSelected ? "text-teal-600 translate-x-0.5" : "text-slate-300 opacity-0 group-hover:opacity-100"}`} />
                  </div>
                </div>
              );
            })}

            {activeProduct && (!activeProduct.categories || activeProduct.categories.length === 0) && (
              <div className="p-8 text-center text-muted text-xs font-semibold">
                No categories added to {activeProduct.name} yet.
                <p className="text-[11px] mt-1 text-slate-400">Click "+ Add" above to add a category.</p>
              </div>
            )}

            {!activeProduct && (
              <div className="p-8 text-center text-muted text-xs font-semibold">
                ← Select a Product to view its categories
              </div>
            )}
          </div>
        </div>

        {/* ── COLUMN 3: SPECIFICATIONS & RATES (Level 3) ── */}
        <div className="lg:col-span-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-100/70 dark:bg-slate-800/60 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                3
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-wider text-themed flex items-center gap-1.5 truncate">
                  <FileText size={15} className="text-emerald-600" /> Specifications
                </h2>
                {activeCategory ? (
                  <p className="text-[10px] text-muted truncate">
                    under <strong className="text-themed">{activeCategory.name}</strong>
                  </p>
                ) : (
                  <p className="text-[10px] text-muted truncate">
                    No category selected
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {activeCategory ? (activeCategory.specifications || []).length : 0}
              </span>
              <button
                type="button"
                onClick={() => handleOpenAddModal({ product: activeProduct?.name || "", category: activeCategory?.name || "" })}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow transition cursor-pointer"
                title="Add Specification"
              >
                <Plus size={12} strokeWidth={2.5} /> Add
              </button>
            </div>
          </div>

          {/* Specifications List */}
          <div className="divide-y divide-[var(--border-color)] max-h-[640px] overflow-y-auto">
            {activeCategory && (activeCategory.specifications || []).map((spec) => {
              const isSelected = spec.id === selectedSpecId;
              return (
                <div
                  key={spec.id}
                  onClick={() => setSelectedSpecId(prev => prev === spec.id ? "" : spec.id)}
                  className={`group p-3 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-emerald-500/10 border-l-4 border-l-emerald-600 shadow-inner font-bold"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {isSelected && (
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        )}
                        <p className={`text-xs leading-snug ${isSelected ? "font-black text-emerald-800 dark:text-emerald-300" : "font-semibold text-themed"}`}>
                          {spec.name}
                        </p>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          ₹{Number(spec.unitPrice || 0).toLocaleString("en-IN")} / {spec.unit || "Sq.Ft"}
                        </span>

                        {spec.discountType === "price" && spec.discountPrice > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                            Disc: ₹{Number(spec.discountPrice).toLocaleString("en-IN")}
                          </span>
                        ) : spec.discountPercent > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            {spec.discountPercent}% OFF
                          </span>
                        ) : spec.discountPrice > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                            Disc: ₹{Number(spec.discountPrice).toLocaleString("en-IN")}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem({
                            type: "specification",
                            id: spec.id,
                            name: spec.name,
                            unitPrice: spec.unitPrice || 0,
                            unit: spec.unit || "Sq.Ft",
                            discountType: spec.discountType || (spec.discountPrice && !spec.discountPercent ? "price" : "percent"),
                            discountPercent: spec.discountPercent !== undefined && spec.discountPercent !== null ? String(spec.discountPercent) : "",
                            discountPrice: spec.discountPrice !== undefined && spec.discountPrice !== null ? String(spec.discountPrice) : ""
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        title="Edit Specification & Rate"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSpecification(spec.id, spec.name);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition"
                        title="Delete Specification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {activeCategory && (!activeCategory.specifications || activeCategory.specifications.length === 0) && (
              <div className="p-8 text-center text-muted text-xs font-semibold">
                No specifications configured for {activeCategory.name} yet.
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal({ product: activeProduct?.name, category: activeCategory.name })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Plus size={12} /> Add Specification
                  </button>
                </div>
              </div>
            )}

            {!activeCategory && (
              <div className="p-8 text-center text-muted text-xs font-semibold">
                ← Select a Category to view or manage its specifications
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── ADD ITEM MODAL ── */}
      <CatalogItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCatalogItem}
        catalogTree={catalogTree}
        presetCategories={PRESET_CATEGORIES}
        standardUnits={STANDARD_UNITS}
        initialProduct={addModalInitialProduct}
        initialCategory={addModalInitialCategory}
      />

      {/* ── EDIT ITEM MODAL ── */}
      {editingItem && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-black uppercase text-themed tracking-wide flex items-center gap-2">
                <Edit3 size={16} className="text-[#C9A227]" />
                Edit {editingItem.type}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Name / Title
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  autoFocus
                />
              </div>

              {editingItem.type === "specification" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Unit Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        required
                        value={editingItem.unitPrice}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
                          const p = parseFloat(val) || 0;
                          let dp = editingItem.discountPrice;
                          let dperc = editingItem.discountPercent;
                          if (editingItem.discountType === "price" && dp && p > 0) {
                            dperc = (((p - parseFloat(dp)) / p) * 100).toFixed(1);
                          } else if (dperc && p > 0) {
                            dp = (p - (p * parseFloat(dperc)) / 100).toFixed(2);
                          }
                          setEditingItem({ ...editingItem, unitPrice: val, discountPrice: dp, discountPercent: dperc });
                        }}
                        className="w-full px-3 py-2 text-xs font-bold text-emerald-600 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Unit
                      </label>
                      <select
                        value={editingItem.unit}
                        onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-slate-900 focus:outline-none"
                      >
                        {STANDARD_UNITS.map((u, idx) => (
                          <option key={idx} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Disc ({(editingItem.discountType || "percent") === "price" ? "₹" : "%"})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const nextType = (editingItem.discountType || "percent") === "price" ? "percent" : "price";
                          setEditingItem({ ...editingItem, discountType: nextType });
                        }}
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-[var(--accent)] border border-amber-500/30 hover:bg-amber-500/20 transition"
                        title="Switch between Percentage and Direct Price discount"
                      >
                        {(editingItem.discountType || "percent") === "price" ? "Switch to %" : "Switch to ₹"}
                      </button>
                    </div>
                    <div className="relative">
                      {(editingItem.discountType || "percent") === "price" && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                      )}
                      <input
                        type="text"
                        inputMode="decimal"
                        value={(editingItem.discountType || "percent") === "price" ? (editingItem.discountPrice || "") : (editingItem.discountPercent || "")}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
                          const numPrice = parseFloat(editingItem.unitPrice) || 0;
                          if ((editingItem.discountType || "percent") === "price") {
                            let dperc = "";
                            if (clean && parseFloat(clean) > 0 && numPrice > 0) {
                              dperc = (((numPrice - parseFloat(clean)) / numPrice) * 100).toFixed(1);
                            }
                            setEditingItem({ ...editingItem, discountPrice: clean, discountPercent: dperc });
                          } else {
                            let dp = "";
                            if (clean && parseFloat(clean) > 0 && numPrice > 0) {
                              dp = (numPrice - (numPrice * parseFloat(clean)) / 100).toFixed(2);
                            }
                            setEditingItem({ ...editingItem, discountPercent: clean, discountPrice: dp });
                          }
                        }}
                        placeholder={(editingItem.discountType || "percent") === "price" ? "0.00 ₹" : "0 %"}
                        className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-amber-600 dark:text-amber-400 ${(editingItem.discountType || "percent") === "price" ? "pl-7" : ""}`}
                      />
                      {(editingItem.discountType || "percent") !== "price" && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-[#C9A227] hover:bg-[#B8911F] text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
