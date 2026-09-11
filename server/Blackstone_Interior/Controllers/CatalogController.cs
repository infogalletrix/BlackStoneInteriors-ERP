using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Blackstone_Interior.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CatalogController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private static readonly object _fileLock = new object();

        public CatalogController(IWebHostEnvironment env)
        {
            _env = env;
        }

        private string GetFilePath()
        {
            var contentRoot = _env.ContentRootPath;
            return Path.Combine(contentRoot, "catalog_data.json");
        }

        public static CatalogPayload GetDefaultCatalog()
        {
            var tree = new List<CatalogProductItem>
            {
                new CatalogProductItem
                {
                    Id = "prod-1",
                    Name = "Kitchen Cabinets",
                    Categories = new List<CatalogCategoryItem>
                    {
                        new CatalogCategoryItem
                        {
                            Id = "cat-1-1",
                            Name = "Carcass / Core Structure",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-1-1-1", Name = "18mm BWP Marine Ply with 0.8mm White Internal Laminate", UnitPrice = 1850, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-1-1-2", Name = "HDHMR Board with 0.8mm Internal Balancer", UnitPrice = 1650, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-1-1-3", Name = "Commercial Plywood with 0.8mm Mica Finish", UnitPrice = 1450, Unit = "Sq.Ft" }
                            }
                        },
                        new CatalogCategoryItem
                        {
                            Id = "cat-1-2",
                            Name = "Shutters & Fascia",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-1-2-1", Name = "Acrylic Finish (2mm) on HDHMR with Edge Banding", UnitPrice = 2350, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-1-2-2", Name = "PU Matte / Gloss Paint Finish on CNC HDHMR", UnitPrice = 2600, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-1-2-3", Name = "Tinted Glass Shutter with 45mm Aluminum Profile", UnitPrice = 2800, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-1-2-4", Name = "1mm High Gloss Laminate with 2mm PVC Edgeband", UnitPrice = 1950, Unit = "Sq.Ft" }
                            }
                        },
                        new CatalogCategoryItem
                        {
                            Id = "cat-1-3",
                            Name = "Hardware & Hinges",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-1-3-1", Name = "Hettich Soft-Close Hinges (Sensys 110 Degree)", UnitPrice = 420, Unit = "Nos" },
                                new CatalogSpecificationItem { Id = "spec-1-3-2", Name = "Hafele Metalla Soft-Close Concealed Hinges", UnitPrice = 380, Unit = "Nos" }
                            }
                        },
                        new CatalogCategoryItem
                        {
                            Id = "cat-1-4",
                            Name = "Drawers & Runners",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-1-4-1", Name = "Hettich Innotech Soft-Close Drawer System (900mm)", UnitPrice = 3400, Unit = "Sets" },
                                new CatalogSpecificationItem { Id = "spec-1-4-2", Name = "Hafele Matrix Box Drawer Runner with Soft Close", UnitPrice = 3100, Unit = "Sets" },
                                new CatalogSpecificationItem { Id = "spec-1-4-3", Name = "Telescopic Soft-Close Channels (20 Inch / Heavy Duty)", UnitPrice = 950, Unit = "Sets" }
                            }
                        },
                        new CatalogCategoryItem
                        {
                            Id = "cat-1-5",
                            Name = "Countertop & Splashback",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-1-5-1", Name = "Quartz Stone Countertop with Edge Chamfering", UnitPrice = 480, Unit = "R.Ft" },
                                new CatalogSpecificationItem { Id = "spec-1-5-2", Name = "Nano White Engineered Marble Countertop", UnitPrice = 550, Unit = "R.Ft" }
                            }
                        },
                        new CatalogCategoryItem
                        {
                            Id = "cat-1-6",
                            Name = "Internal Accessories & Wirework",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-1-6-1", Name = "Higold SS304 Matt Black 2-Tier Bottle Pullout (300mm)", UnitPrice = 4500, Unit = "Nos" },
                                new CatalogSpecificationItem { Id = "spec-1-6-2", Name = "PVC Cutlery Organizer Tray - 900mm", UnitPrice = 1800, Unit = "Nos" }
                            }
                        }
                    }
                },
                new CatalogProductItem
                {
                    Id = "prod-2",
                    Name = "Wardrobe",
                    Categories = new List<CatalogCategoryItem>
                    {
                        new CatalogCategoryItem
                        {
                            Id = "cat-2-1",
                            Name = "Carcass / Core Structure",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-2-1-1", Name = "18mm BWP Marine Ply with 0.8mm Fabric Texture Laminate", UnitPrice = 1750, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-2-1-2", Name = "Commercial Plywood with 0.8mm Internal Mica", UnitPrice = 1400, Unit = "Sq.Ft" }
                            }
                        },
                        new CatalogCategoryItem
                        {
                            Id = "cat-2-2",
                            Name = "Shutters & Fascia",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-2-2-1", Name = "Sliding Shutters with Heavy Duty Aluminum Track System", UnitPrice = 2450, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-2-2-2", Name = "Hinged Full-Height Shutters with Gold Profile Handles", UnitPrice = 2100, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-2-2-3", Name = "Tinted Fluted Glass in Slim Aluminum Frame", UnitPrice = 2900, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-2-2-4", Name = "Natural Teak Veneer with Melamine Matte Polish", UnitPrice = 2750, Unit = "Sq.Ft" }
                            }
                        },
                        new CatalogCategoryItem
                        {
                            Id = "cat-2-3",
                            Name = "Internal Accessories & Wirework",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-2-3-1", Name = "Pull-out Trouser & Tie Rack", UnitPrice = 3800, Unit = "Nos" },
                                new CatalogSpecificationItem { Id = "spec-2-3-2", Name = "Built-in Profile Light with Motion Sensor & Driver", UnitPrice = 350, Unit = "R.Ft" },
                                new CatalogSpecificationItem { Id = "spec-2-3-3", Name = "Jewelry & Valuables Soft Velvet Drawer", UnitPrice = 2800, Unit = "Nos" }
                            }
                        }
                    }
                },
                new CatalogProductItem
                {
                    Id = "prod-3",
                    Name = "TV Unit",
                    Categories = new List<CatalogCategoryItem>
                    {
                        new CatalogCategoryItem
                        {
                            Id = "cat-3-1",
                            Name = "Paneling & Framing",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-3-1-1", Name = "Fluted Charcoal Louver Paneling with Brass Inlay", UnitPrice = 650, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-3-1-2", Name = "Natural Teak Veneer Wall Paneling with PU Finish", UnitPrice = 850, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-3-1-3", Name = "Large Format Tile Cladding on Plywood Backing", UnitPrice = 1200, Unit = "Sq.Ft" }
                            }
                        },
                        new CatalogCategoryItem
                        {
                            Id = "cat-3-2",
                            Name = "Drawers & Runners",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-3-2-1", Name = "Floating Console with Soft-Close Drawers & Chamfered Edge", UnitPrice = 1650, Unit = "R.Ft" },
                                new CatalogSpecificationItem { Id = "spec-3-2-2", Name = "CNC Geometric Grooving on HDHMR with PU Polish", UnitPrice = 1950, Unit = "R.Ft" }
                            }
                        }
                    }
                },
                new CatalogProductItem
                {
                    Id = "prod-4",
                    Name = "False Ceiling",
                    Categories = new List<CatalogCategoryItem>
                    {
                        new CatalogCategoryItem
                        {
                            Id = "cat-4-1",
                            Name = "Carcass / Core Structure",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-4-1-1", Name = "Gyproc Saint-Gobain Gypsum Board Ceiling with GI Framing", UnitPrice = 135, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-4-1-2", Name = "POP Punning with Designer Grooving", UnitPrice = 85, Unit = "Sq.Ft" }
                            }
                        },
                        new CatalogCategoryItem
                        {
                            Id = "cat-4-2",
                            Name = "Cove & Accent Lighting",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-4-2-1", Name = "Indirect Perimeter Cove with Concealed Profile Channel", UnitPrice = 180, Unit = "R.Ft" },
                                new CatalogSpecificationItem { Id = "spec-4-2-2", Name = "Wooden Rafter Ceiling Detail with Melamine Polish", UnitPrice = 450, Unit = "R.Ft" }
                            }
                        }
                    }
                },
                new CatalogProductItem
                {
                    Id = "prod-5",
                    Name = "Shoe Rack",
                    Categories = new List<CatalogCategoryItem>
                    {
                        new CatalogCategoryItem
                        {
                            Id = "cat-5-1",
                            Name = "Carcass / Core Structure",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-5-1-1", Name = "Commercial Plywood with Louvered Ventilation Shutters", UnitPrice = 1600, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-5-1-2", Name = "Cushioned Top Seating Bench with Drawer Storage", UnitPrice = 1850, Unit = "R.Ft" }
                            }
                        }
                    }
                },
                new CatalogProductItem
                {
                    Id = "prod-6",
                    Name = "Study Table & Bookshelf",
                    Categories = new List<CatalogCategoryItem>
                    {
                        new CatalogCategoryItem
                        {
                            Id = "cat-6-1",
                            Name = "Carcass / Core Structure",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-6-1-1", Name = "Plywood Study Desktop with Wire Grommet & Soft-Close Drawers", UnitPrice = 1850, Unit = "R.Ft" },
                                new CatalogSpecificationItem { Id = "spec-6-1-2", Name = "Overhead Open Display Bookshelf with Built-in Light", UnitPrice = 1550, Unit = "Sq.Ft" }
                            }
                        }
                    }
                },
                new CatalogProductItem
                {
                    Id = "prod-7",
                    Name = "Pooja Unit",
                    Categories = new List<CatalogCategoryItem>
                    {
                        new CatalogCategoryItem
                        {
                            Id = "cat-7-1",
                            Name = "Finishing & Detailing",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-7-1-1", Name = "Solid Teak Wood Jali Cutting with CNC Detailing & Bell Inlay", UnitPrice = 1450, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-7-1-2", Name = "Backlit Onyx Marble Panel with LED Warm Illumination", UnitPrice = 2200, Unit = "Sq.Ft" }
                            }
                        }
                    }
                },
                new CatalogProductItem
                {
                    Id = "prod-8",
                    Name = "Vanity Cabinet",
                    Categories = new List<CatalogCategoryItem>
                    {
                        new CatalogCategoryItem
                        {
                            Id = "cat-8-1",
                            Name = "Carcass / Core Structure",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-8-1-1", Name = "100% Water-Resistant PVC / Foam Board with Acrylic Finish", UnitPrice = 2100, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-8-1-2", Name = "LED Backlit Touch Sensor Mirror (Custom Size)", UnitPrice = 4500, Unit = "Nos" }
                            }
                        }
                    }
                },
                new CatalogProductItem
                {
                    Id = "prod-9",
                    Name = "Bed with Storage",
                    Categories = new List<CatalogCategoryItem>
                    {
                        new CatalogCategoryItem
                        {
                            Id = "cat-9-1",
                            Name = "Carcass / Core Structure",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-9-1-1", Name = "Hydraulic Lift-up Bed Frame with Heavy Duty Gas Struts (King Size)", UnitPrice = 48000, Unit = "Nos" },
                                new CatalogSpecificationItem { Id = "spec-9-1-2", Name = "Drawer Storage Bed with 18mm Plywood Structure", UnitPrice = 38000, Unit = "Nos" }
                            }
                        },
                        new CatalogCategoryItem
                        {
                            Id = "cat-9-2",
                            Name = "Cushioning & Upholstery",
                            Specifications = new List<CatalogSpecificationItem>
                            {
                                new CatalogSpecificationItem { Id = "spec-9-2-1", Name = "Full-Height Fluted Headboard in Velvet / Suede Upholstery", UnitPrice = 650, Unit = "Sq.Ft" },
                                new CatalogSpecificationItem { Id = "spec-9-2-2", Name = "Geometric Diamond Tufted Headboard Cushioning", UnitPrice = 750, Unit = "Sq.Ft" }
                            }
                        }
                    }
                }
            };

            var payload = new CatalogPayload { Tree = tree };
            SyncFlatLists(payload);
            return payload;
        }

        private static void SyncFlatLists(CatalogPayload payload)
        {
            if (payload == null || payload.Tree == null) return;

            var products = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var categories = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var specifications = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var p in payload.Tree)
            {
                if (!string.IsNullOrWhiteSpace(p.Name)) products.Add(p.Name.Trim());
                if (p.Categories != null)
                {
                    foreach (var c in p.Categories)
                    {
                        if (!string.IsNullOrWhiteSpace(c.Name)) categories.Add(c.Name.Trim());
                        if (c.Specifications != null)
                        {
                            foreach (var s in c.Specifications)
                            {
                                if (!string.IsNullOrWhiteSpace(s.Name)) specifications.Add(s.Name.Trim());
                            }
                        }
                    }
                }
            }

            payload.Products = products.ToList();
            payload.Categories = categories.ToList();
            payload.Specifications = specifications.ToList();
        }

        [HttpGet]
        public IActionResult GetCatalog()
        {
            lock (_fileLock)
            {
                var filePath = GetFilePath();
                if (!System.IO.File.Exists(filePath))
                {
                    var defaults = GetDefaultCatalog();
                    var json = JsonSerializer.Serialize(defaults, new JsonSerializerOptions { WriteIndented = true });
                    System.IO.File.WriteAllText(filePath, json);
                    return Ok(defaults);
                }

                try
                {
                    var json = System.IO.File.ReadAllText(filePath);
                    var payload = JsonSerializer.Deserialize<CatalogPayload>(json);
                    if (payload == null || payload.Tree == null || payload.Tree.Count == 0)
                    {
                        payload = GetDefaultCatalog();
                        var newJson = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });
                        System.IO.File.WriteAllText(filePath, newJson);
                    }
                    else
                    {
                        SyncFlatLists(payload);
                    }
                    return Ok(payload);
                }
                catch
                {
                    var defaults = GetDefaultCatalog();
                    return Ok(defaults);
                }
            }
        }

        [HttpPost]
        public IActionResult SaveCatalog([FromBody] CatalogPayload payload)
        {
            if (payload == null)
            {
                return BadRequest("Invalid catalog data");
            }

            if (payload.Tree == null || payload.Tree.Count == 0)
            {
                // If caller passed flat items only, retain or regenerate defaults
                payload = GetDefaultCatalog();
            }
            else
            {
                SyncFlatLists(payload);
            }

            lock (_fileLock)
            {
                var filePath = GetFilePath();
                var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });
                System.IO.File.WriteAllText(filePath, json);
            }

            return Ok(new { message = "Catalog saved successfully", data = payload });
        }

        [HttpPost("reset")]
        public IActionResult ResetCatalog()
        {
            var defaults = GetDefaultCatalog();
            lock (_fileLock)
            {
                var filePath = GetFilePath();
                var json = JsonSerializer.Serialize(defaults, new JsonSerializerOptions { WriteIndented = true });
                System.IO.File.WriteAllText(filePath, json);
            }

            return Ok(new { message = "Catalog reset to defaults", data = defaults });
        }
    }

    public class CatalogSpecificationItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; } = 0;
        public string Unit { get; set; } = "Sq.Ft";
    }

    public class CatalogCategoryItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public List<CatalogSpecificationItem> Specifications { get; set; } = new List<CatalogSpecificationItem>();
    }

    public class CatalogProductItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public List<CatalogCategoryItem> Categories { get; set; } = new List<CatalogCategoryItem>();
    }

    public class CatalogPayload
    {
        public List<CatalogProductItem> Tree { get; set; } = new List<CatalogProductItem>();
        public List<string> Products { get; set; } = new List<string>();
        public List<string> Categories { get; set; } = new List<string>();
        public List<string> Specifications { get; set; } = new List<string>();
    }
}
