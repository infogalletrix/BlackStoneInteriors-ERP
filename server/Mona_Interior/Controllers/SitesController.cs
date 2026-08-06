using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mona_Interior.Dtos;
using Mona_Interior.models;
using System.Text.Json;

namespace Mona_Interior.Controllers
{
    [ApiController]
    [Route("api/sites")]
    public class SitesController : ControllerBase
    {
        private readonly MonainteriorDbContext _db;
        public SitesController(MonainteriorDbContext db) => _db = db;

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
                site.Maintenance = dto.Maintenance.Value.GetRawText();
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
