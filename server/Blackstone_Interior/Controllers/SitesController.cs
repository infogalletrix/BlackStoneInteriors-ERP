using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Blackstone_Interior.Dtos;
using Blackstone_Interior.models;
using System.Text.Json;

namespace Blackstone_Interior.Controllers
{
    [ApiController]
    [Route("api/sites")]
    public class SitesController : ControllerBase
    {
        private readonly BlackstoneinteriorDbContext _db;
        public SitesController(BlackstoneinteriorDbContext db) => _db = db;

        // GET /api/sites
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sites = await _db.Sites.ToListAsync();
            return Ok(sites.Select(s => {
                object parsedWH = new object();
                try { if (!string.IsNullOrWhiteSpace(s.WorkHistory)) parsedWH = JsonSerializer.Deserialize<JsonElement>(s.WorkHistory); else parsedWH = JsonSerializer.Deserialize<JsonElement>("[]"); } catch { parsedWH = JsonSerializer.Deserialize<JsonElement>("[]"); }

                object parsedMain = new object();
                try { if (!string.IsNullOrWhiteSpace(s.Maintenance)) parsedMain = JsonSerializer.Deserialize<JsonElement>(s.Maintenance); else parsedMain = JsonSerializer.Deserialize<JsonElement>("{}"); } catch { parsedMain = JsonSerializer.Deserialize<JsonElement>("{}"); }

                object parsedMed = new object();
                try { if (!string.IsNullOrWhiteSpace(s.Media)) parsedMed = JsonSerializer.Deserialize<JsonElement>(s.Media); else parsedMed = JsonSerializer.Deserialize<JsonElement>("[]"); } catch { parsedMed = JsonSerializer.Deserialize<JsonElement>("[]"); }
                
                return new
                {
                    id = s.Id,
                    name = s.Name,
                    clientName = s.ClientName,
                    organizationName = s.OrganizationName,
                    assignedTeam = s.AssignedTeam,
                    address = s.Address,
                    status = s.Status,
                    startDate = s.StartDate,
                    budget = s.Budget,
                    description = s.Description,
                    isNegotiated = s.IsNegotiated,
                    negotiationDetails = s.NegotiationDetails,
                    isArchived = s.IsArchived,
                    workHistory = parsedWH,
                    maintenance = parsedMain,
                    media = parsedMed
                };
            }));
        }

        // POST /api/sites
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SiteDto dto)
        {
            var site = new Site
            {
                Name = dto.Name,
                ClientName = dto.ClientName,
                OrganizationName = dto.OrganizationName ?? "",
                AssignedTeam = dto.AssignedTeam,
                Address = dto.Address,
                Status = dto.Status,
                StartDate = dto.StartDate,
                Budget = dto.Budget,
                Description = dto.Description,
                IsNegotiated = dto.IsNegotiated,
                NegotiationDetails = dto.NegotiationDetails ?? "",
                IsArchived = dto.IsArchived,
                WorkHistory = dto.WorkHistory.HasValue ? dto.WorkHistory.Value.GetRawText() : "[]",
                Maintenance = dto.Maintenance.HasValue ? dto.Maintenance.Value.GetRawText() : "{}",
                Media = dto.Media.HasValue ? dto.Media.Value.GetRawText() : "[]"
            };
            _db.Sites.Add(site);
            await _db.SaveChangesAsync();
            return Ok(new { id = site.Id, message = "Site created" });
        }

        // PUT /api/sites/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SiteDto dto)
        {
            var site = await _db.Sites.FindAsync(id);
            if (site == null) return NotFound();
            site.Name = dto.Name;
            site.ClientName = dto.ClientName;
            site.OrganizationName = dto.OrganizationName ?? site.OrganizationName;
            site.AssignedTeam = dto.AssignedTeam;
            site.Address = dto.Address;
            site.Status = dto.Status;
            site.StartDate = dto.StartDate;
            site.Budget = dto.Budget;
            site.Description = dto.Description;
            site.IsNegotiated = dto.IsNegotiated;
            site.NegotiationDetails = dto.NegotiationDetails ?? "";
            site.IsArchived = dto.IsArchived;
            if (dto.WorkHistory.HasValue)
                site.WorkHistory = dto.WorkHistory.Value.GetRawText();
            
            if (dto.Maintenance.HasValue)
            {
                var maintenanceJson = dto.Maintenance.Value.GetRawText();
                site.Maintenance = maintenanceJson;

                try 
                {
                    var maintObj = JsonSerializer.Deserialize<JsonElement>(maintenanceJson);
                    if (maintObj.TryGetProperty("required", out JsonElement reqProp) && reqProp.GetBoolean())
                    {
                        var clientName = site.ClientName ?? "Unknown Client";
                        var contact = await _db.CrmContacts.FirstOrDefaultAsync(c => c.Name == clientName);
                        if (contact == null)
                        {
                            contact = new CrmContact
                            {
                                Name = clientName,
                                OrganizationName = site.OrganizationName ?? "",
                                Project = site.Name ?? "",
                                Address = site.Address ?? "",
                                Status = "Lead",
                                Source = "Auto (Maintenance)",
                                Date = DateTime.Now.ToString("yyyy-MM-dd"),
                                Tags = "[\"Maintenance\"]"
                            };
                            _db.CrmContacts.Add(contact);
                            await _db.SaveChangesAsync(); // Save to get the ContactId
                        }

                        string dealTitle = $"{site.Name} - Maintenance";
                        var existingDeal = await _db.Deals.FirstOrDefaultAsync(d => d.ContactId == contact.Id && d.Title == dealTitle);
                        
                        if (existingDeal == null)
                        {
                            var deal = new Deal
                            {
                                Title = dealTitle,
                                Value = 0,
                                ContactId = contact.Id,
                                Stage = "LEAD",
                                CloseDate = maintObj.TryGetProperty("nextDue", out JsonElement dueProp) ? dueProp.GetString() ?? "" : ""
                            };
                            _db.Deals.Add(deal);
                        }
                    }
                }
                catch { /* Ignore parse errors */ }
            }

            if (dto.Media.HasValue)
                site.Media = dto.Media.Value.GetRawText();
                
            await _db.SaveChangesAsync();
            return Ok(new { message = "Site updated" });
        }

        // DELETE /api/sites/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var site = await _db.Sites.FindAsync(id);
            if (site == null) return NotFound();
            _db.Sites.Remove(site);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Site deleted" });
        }
    }
}
