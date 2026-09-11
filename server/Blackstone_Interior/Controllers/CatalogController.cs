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

        private CatalogPayload GetDefaultCatalog()
        {
            return new CatalogPayload
            {
                Products = new List<string>
                {
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
                },
                Categories = new List<string>
                {
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
                },
                Specifications = new List<string>
                {
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
                }
            };
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
                    if (payload == null) payload = GetDefaultCatalog();
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

    public class CatalogPayload
    {
        public List<string> Products { get; set; } = new List<string>();
        public List<string> Categories { get; set; } = new List<string>();
        public List<string> Specifications { get; set; } = new List<string>();
    }
}
