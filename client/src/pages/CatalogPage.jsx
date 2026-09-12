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

  // Input states for adding new items
  const [newProductName, setNewProductName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecPrice, setNewSpecPrice] = useState("");
  const [newSpecUnit, setNewSpecUnit] = useState("Sq.Ft");

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
    return catalogTree.find(p => p.id === selectedProductId) || catalogTree[0] || null;
  }, [catalogTree, selectedProductId]);

  // Auto-select first category if current selection becomes invalid
  useEffect(() => {
    if (activeProduct && activeProduct.categories && activeProduct.categories.length > 0) {
      const exists = activeProduct.categories.some(c => c.id === selectedCategoryId);
      if (!exists) {
        setSelectedCategoryId(activeProduct.categories[0].id);
      }
    } else {
      setSelectedCategoryId("");
    }
  }, [activeProduct, selectedCategoryId]);

  const activeCategory = useMemo(() => {
    if (!activeProduct || !activeProduct.categories) return null;
    return activeProduct.categories.find(c => c.id === selectedCategoryId) || null;
  }, [activeProduct, selectedCategoryId]);

  // ── PRODUCT ACTIONS ──────────────────────────────────────────
  const handleAddProduct = (e) => {
    e.preventDefault();
    const name = newProductName.trim();
    if (!name) return;
    if (catalogTree.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      showDialog({ title: "Product Exists", message: `A product named "${name}" already exists.`, type: "alert" });
      return;
    }

    const newProd = {
      id: "prod-" + Date.now(),
      name,
      categories: [
        {
          id: "cat-" + Date.now(),
          name: "Carcass / Core Structure",
          specifications: []
        }
      ]
    };
    const updated = [...catalogTree, newProd];
    setCatalogTree(updated);
    setSelectedProductId(newProd.id);
    setSelectedCategoryId(newProd.categories[0].id);
    setNewProductName("");
    persistToServer(updated);
  };

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
          setSelectedCategoryId(next && next.categories[0] ? next.categories[0].id : "");
        }
        persistToServer(updated);
      }
    });
  };

  // ── CATEGORY ACTIONS ─────────────────────────────────────────
  const handleAddCategory = (catNameToAdd = null) => {
    if (!activeProduct) {
      showDialog({ title: "No Product Selected", message: "Please select or create a product first.", type: "alert" });
      return;
    }
    const name = (catNameToAdd || newCategoryName).trim();
    if (!name) return;

    if (activeProduct.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      showDialog({ title: "Category Exists", message: `Category "${name}" already exists under ${activeProduct.name}.`, type: "alert" });
      return;
    }

    const newCat = {
      id: "cat-" + Date.now(),
      name,
      specifications: []
    };

    const updated = catalogTree.map(p => {
      if (p.id === activeProduct.id) {
        return {
          ...p,
          categories: [...(p.categories || []), newCat]
        };
      }
      return p;
    });

    setCatalogTree(updated);
    setSelectedCategoryId(newCat.id);
    setNewCategoryName("");
    persistToServer(updated);
  };

  const handleDeleteCategory = (catId, catName) => {
    showDialog({
      title: "Delete Category",
      message: `Are you sure you want to remove "${catName}" from ${activeProduct.name}?`,
      type: "confirm",
      onConfirm: () => {
        const updated = catalogTree.map(p => {
          if (p.id === activeProduct.id) {
            return {
              ...p,
              categories: (p.categories || []).filter(c => c.id !== catId)
            };
          }
          return p;
        });
        setCatalogTree(updated);
        persistToServer(updated);
      }
    });
  };

  // ── SPECIFICATION ACTIONS ────────────────────────────────────
  const handleAddSpecification = (e) => {
    e.preventDefault();
    if (!activeProduct || !activeCategory) {
      showDialog({ title: "Selection Missing", message: "Please select both a Product and a Category first.", type: "alert" });
      return;
    }

    const name = newSpecName.trim();
    if (!name) return;

    const price = parseFloat(newSpecPrice) || 0;
    const unit = newSpecUnit.trim() || "Sq.Ft";

    const newSpec = {
      id: "spec-" + Date.now(),
      name,
      unitPrice: price,
      unit
    };

    const updated = catalogTree.map(p => {
      if (p.id === activeProduct.id) {
        return {
          ...p,
          categories: (p.categories || []).map(c => {
            if (c.id === activeCategory.id) {
              return {
                ...c,
                specifications: [...(c.specifications || []), newSpec]
              };
            }
            return c;
          })
        };
      }
      return p;
    });

    setCatalogTree(updated);
    setNewSpecName("");
    setNewSpecPrice("");
    setNewSpecUnit("Sq.Ft");
    persistToServer(updated);
  };

  const handleDeleteSpecification = (specId, specName) => {
    showDialog({
      title: "Delete Specification",
      message: `Delete "${specName}"?`,
      type: "confirm",
      onConfirm: () => {
        const updated = catalogTree.map(p => {
          if (p.id === activeProduct.id) {
            return {
              ...p,
              categories: (p.categories || []).map(c => {
                if (c.id === activeCategory.id) {
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
      updated = updated.map(p => {
        if (p.id === activeProduct?.id) {
          return {
            ...p,
            categories: (p.categories || []).map(c => {
              if (c.id === activeCategory?.id) {
                return {
                  ...c,
                  specifications: (c.specifications || []).map(s => 
                    s.id === id ? { ...s, name: name.trim(), unitPrice: parseFloat(unitPrice) || 0, unit: unit || "Sq.Ft" } : s
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
    <div className={`p-4 md:p-6 space-y-6 max-w-7xl mx-auto ${t.text}`}>
      {/* ── HEADER BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#1e293b] to-slate-900 border border-slate-800 p-6 shadow-xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Package className="text-[#C9A227]" size={28} />
              Master Catalog Management
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium">
              3-Level Layered Structure: <span className="text-amber-300 font-bold">Product</span> → <span className="text-amber-300 font-bold">Category</span> → <span className="text-amber-300 font-bold">Specification with Unit Price (₹)</span>. Automatically auto-fills rates and units in quotations!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {saveSuccessMsg && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <CheckCircle2 size={14} /> {saveSuccessMsg}
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
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex-shrink-0">
            {activeProduct ? activeProduct.name : "No Product"}
          </span>
          <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
          <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 flex-shrink-0">
            {activeCategory ? activeCategory.name : "Select Category"}
          </span>
        </div>

        {/* Global Search */}
        <div className="relative w-full md:w-72">
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
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {filteredProducts.length}
            </span>
          </div>

          {/* Quick Add Product Form */}
          <form onSubmit={handleAddProduct} className="p-3 border-b border-[var(--border-color)] bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="New product (e.g. Bar Counter)..."
                className="flex-1 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--border-color)] bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <button
                type="submit"
                disabled={!newProductName.trim()}
                className="px-3.5 py-2 bg-[#C9A227] hover:bg-[#B8911F] disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 transition"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </form>

          {/* Product Items List */}
          <div className="divide-y divide-[var(--border-color)] max-h-[580px] overflow-y-auto">
            {filteredProducts.map((prod) => {
              const isSelected = prod.id === selectedProductId;
              const totalCats = (prod.categories || []).length;
              const totalSpecs = (prod.categories || []).reduce((sum, c) => sum + (c.specifications || []).length, 0);

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    setSelectedProductId(prod.id);
                    if (prod.categories && prod.categories.length > 0) {
                      setSelectedCategoryId(prod.categories[0].id);
                    } else {
                      setSelectedCategoryId("");
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
                {activeProduct && (
                  <p className="text-[10px] text-muted truncate">
                    under <strong className="text-themed">{activeProduct.name}</strong>
                  </p>
                )}
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {activeProduct ? (activeProduct.categories || []).length : 0}
            </span>
          </div>

          {/* Quick Add Category Form */}
          {activeProduct ? (
            <form onSubmit={(e) => { e.preventDefault(); handleAddCategory(); }} className="p-3 border-b border-[var(--border-color)] bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category (e.g. Carcass, Shutters)..."
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--border-color)] bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
                <button
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 transition"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 text-center text-xs text-muted font-medium bg-slate-50/50 dark:bg-slate-900/50">
              Select a Product first
            </div>
          )}

          {/* Categories List */}
          <div className="divide-y divide-[var(--border-color)] max-h-[580px] overflow-y-auto">
            {activeProduct && (activeProduct.categories || []).map((cat) => {
              const isSelected = cat.id === selectedCategoryId;
              const specCount = (cat.specifications || []).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
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
                <p className="text-[11px] mt-1 text-slate-400">Add a category using the inputs above.</p>
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
                {activeCategory && (
                  <p className="text-[10px] text-muted truncate">
                    under <strong className="text-themed">{activeCategory.name}</strong>
                  </p>
                )}
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {activeCategory ? (activeCategory.specifications || []).length : 0}
            </span>
          </div>

          {/* Add Specification Form */}
          {activeCategory ? (
            <form onSubmit={handleAddSpecification} className="p-3 border-b border-[var(--border-color)] bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div>
                <input
                  type="text"
                  value={newSpecName}
                  onChange={(e) => setNewSpecName(e.target.value)}
                  placeholder="Specification / Material description..."
                  className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--border-color)] bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  required
                />
              </div>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-7 relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    step="any"
                    value={newSpecPrice}
                    onChange={(e) => setNewSpecPrice(e.target.value)}
                    placeholder="Unit Price"
                    className="w-full pl-6 pr-2 py-1.5 text-xs font-bold rounded-xl border border-[var(--border-color)] bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                  />
                </div>
                <div className="col-span-5">
                  <select
                    value={newSpecUnit}
                    onChange={(e) => setNewSpecUnit(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-bold rounded-xl border border-[var(--border-color)] bg-white dark:bg-slate-900 focus:outline-none text-slate-700 dark:text-slate-200"
                  >
                    {STANDARD_UNITS.map((u, idx) => (
                      <option key={idx} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={!newSpecName.trim()}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition"
              >
                <Plus size={13} /> Add Specification & Unit Rate
              </button>
            </form>
          ) : (
            <div className="p-4 text-center text-xs text-muted font-medium bg-slate-50/50 dark:bg-slate-900/50">
              ← Select a Category to view or add specifications
            </div>
          )}

          {/* Specifications List */}
          <div className="divide-y divide-[var(--border-color)] max-h-[580px] overflow-y-auto">
            {activeCategory && (activeCategory.specifications || []).map((spec) => (
              <div
                key={spec.id}
                className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-themed leading-snug">
                      {spec.name}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        ₹{Number(spec.unitPrice || 0).toLocaleString("en-IN")} / {spec.unit || "Sq.Ft"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingItem({
                        type: "specification",
                        id: spec.id,
                        name: spec.name,
                        unitPrice: spec.unitPrice || 0,
                        unit: spec.unit || "Sq.Ft"
                      })}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      title="Edit Specification & Rate"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSpecification(spec.id, spec.name)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition"
                      title="Delete Specification"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {activeCategory && (!activeCategory.specifications || activeCategory.specifications.length === 0) && (
              <div className="p-8 text-center text-muted text-xs font-semibold">
                No specifications configured for {activeCategory.name}.
                <p className="text-[11px] mt-1 text-slate-400">Use the form above to add specifications and default unit rates.</p>
              </div>
            )}
          </div>
        </div>

      </div>

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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Unit Price (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editingItem.unitPrice}
                      onChange={(e) => setEditingItem({ ...editingItem, unitPrice: e.target.value })}
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
