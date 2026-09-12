using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Blackstone_Interior.Dtos;
using Blackstone_Interior.models;
using System.Text.Json;

namespace Blackstone_Interior.Controllers
{
    [ApiController]
    [Route("api/crm")]
    public class CrmController : ControllerBase
    {
        private readonly BlackstoneinteriorDbContext _db;
        public CrmController(BlackstoneinteriorDbContext db) => _db = db;

        // Ã¢â€â‚¬Ã¢â€â‚¬ CONTACTS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

        // GET /api/crm
        [HttpGet]
        public async Task<IActionResult> GetContacts()
        {
            var contacts = await _db.CrmContacts.ToListAsync();
            var result = contacts.Select(c => {
                List<string> parsedTags = new List<string>();
                try { if (!string.IsNullOrWhiteSpace(c.Tags)) parsedTags = JsonSerializer.Deserialize<List<string>>(c.Tags); } catch {}
                
                return new
                {
                    id = c.Id.ToString(),
                    name = c.Name,
                    organizationName = c.OrganizationName,
                    phone = c.Phone,
                    email = c.Email,
                    project = c.Project,
                    address = c.Address,
                    status = c.Status,
                    clientType = string.IsNullOrWhiteSpace(c.ClientType) 
                        ? (!string.IsNullOrWhiteSpace(c.OrganizationName) ? "B2B" : "B2C") 
                        : c.ClientType,
                    source = c.Source,
                    tags = parsedTags,
                    date = c.Date
                };
            });
            return Ok(result);
        }

        // POST /api/crm
        [HttpPost]
        public async Task<IActionResult> CreateContact([FromBody] CrmContactDto dto)
        {
            // The leads id must be the next number of the highest number; if 0 leads it starts from 1
            int highestId = await _db.CrmContacts.Select(c => (int?)c.Id).MaxAsync() ?? 0;
            int nextId = highestId + 1;

            var contact = new CrmContact
            {
                Id = nextId,
                Name = dto.Name,
                OrganizationName = dto.OrganizationName ?? "",
                Phone = dto.Phone,
                Email = dto.Email,
                Project = dto.Project,
                Address = dto.Address,
                Status = dto.Status,
                ClientType = !string.IsNullOrWhiteSpace(dto.ClientType)
                    ? dto.ClientType
                    : (!string.IsNullOrWhiteSpace(dto.OrganizationName) ? "B2B" : "B2C"),
                Source = dto.Source,
                Tags = JsonSerializer.Serialize(dto.Tags ?? new List<string>()),
                Date = dto.Date ?? DateTime.Now.ToString("yyyy-MM-dd")
            };
            _db.CrmContacts.Add(contact);
            await _db.SaveChangesAsync();

            try
            {
                await _db.Database.ExecuteSqlInterpolatedAsync($"ALTER TABLE CrmContacts AUTO_INCREMENT = {nextId + 1};");
            }
            catch {}

            return Ok(new { id = contact.Id.ToString(), message = "Contact created" });
        }

        // PUT /api/crm/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContact(int id, [FromBody] CrmContactDto dto)
        {
            var contact = await _db.CrmContacts.FindAsync(id);
            if (contact == null) return NotFound();

            contact.Name = dto.Name;
            contact.OrganizationName = dto.OrganizationName ?? contact.OrganizationName;
            contact.Phone = dto.Phone;
            contact.Email = dto.Email;
            contact.Project = dto.Project;
            contact.Address = dto.Address;
            contact.Status = dto.Status;
            if (!string.IsNullOrWhiteSpace(dto.ClientType))
            {
                contact.ClientType = dto.ClientType;
            }
            contact.Source = dto.Source;
            contact.Tags = JsonSerializer.Serialize(dto.Tags ?? new List<string>());

            await _db.SaveChangesAsync();
            return Ok(new { message = "Contact updated" });
        }

        // DELETE /api/crm/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContact(int id)
        {
            var contact = await _db.CrmContacts.FindAsync(id);
            if (contact == null) return NotFound();

            // Clean up related Activities
            var activities = await _db.Activities.Where(a => a.ClientId == id.ToString()).ToListAsync();
            if (activities.Any()) _db.Activities.RemoveRange(activities);

            // Clean up related Deals and their Quotations
            var deals = await _db.Deals.Where(d => d.ContactId == id).ToListAsync();
            foreach(var deal in deals)
            {
                var quotes = await _db.Quotations.Where(q => q.DealId == deal.Id).ToListAsync();
                if (quotes.Any()) _db.Quotations.RemoveRange(quotes);
            }
            if (deals.Any()) _db.Deals.RemoveRange(deals);

            _db.CrmContacts.Remove(contact);
            await _db.SaveChangesAsync();

            try
            {
                int remainingMaxId = await _db.CrmContacts.Select(c => (int?)c.Id).MaxAsync() ?? 0;
                await _db.Database.ExecuteSqlInterpolatedAsync($"ALTER TABLE CrmContacts AUTO_INCREMENT = {remainingMaxId + 1};");
            }
            catch {}

            return Ok(new { message = "Contact deleted" });
        }

        // Ã¢â€â‚¬Ã¢â€â‚¬ DEALS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

        // GET /api/crm/deals/all
        [HttpGet("deals/all")]
        public async Task<IActionResult> GetDeals()
        {
            // Auto-clean stale initial LEAD deals for contacts that have already advanced to PROPOSAL, NEGOTIATION, or WON
            var contactsWithAdvancedDeals = await _db.Deals
                .Where(d => d.ContactId > 0 && (d.Stage == "PROPOSAL" || d.Stage == "NEGOTIATION" || d.Stage == "WON"))
                .Select(d => d.ContactId)
                .Distinct()
                .ToListAsync();

            if (contactsWithAdvancedDeals.Any())
            {
                var candidateLeadDeals = await _db.Deals
                    .Where(d => contactsWithAdvancedDeals.Contains(d.ContactId) && d.Stage == "LEAD")
                    .ToListAsync();

                var staleLeadDeals = candidateLeadDeals
                    .Where(d => d.Value == 0 || !_db.Quotations.Any(q => q.DealId == d.Id))
                    .ToList();

                if (staleLeadDeals.Any())
                {
                    _db.Deals.RemoveRange(staleLeadDeals);
                    await _db.SaveChangesAsync();
                }
            }

            var quotations = await _db.Quotations.ToListAsync();
            var contacts = await _db.CrmContacts.ToListAsync();
            var deals = await _db.Deals.ToListAsync();
            var result = deals.Select(d =>
            {
                string closeDate = d.CloseDate;
                var linkedQuote = quotations.FirstOrDefault(q => q.DealId == d.Id);
                if (linkedQuote != null && !string.IsNullOrWhiteSpace(linkedQuote.Date))
                {
                    closeDate = linkedQuote.Date;
                }
                else if (string.IsNullOrWhiteSpace(closeDate))
                {
                    var linkedContact = contacts.FirstOrDefault(c => c.Id == d.ContactId);
                    if (linkedContact != null && !string.IsNullOrWhiteSpace(linkedContact.Date))
                    {
                        closeDate = linkedContact.Date;
                    }
                }

                return new
                {
                    id = d.Id.ToString(),
                    title = d.Title,
                    value = d.Value,
                    contact_id = d.ContactId.ToString(),
                    stage = d.Stage,
                    close_date = closeDate
                };
            });
            return Ok(result);
        }

        // POST /api/crm/deals
        [HttpPost("deals")]
        public async Task<IActionResult> CreateDeal([FromBody] DealDto dto)
        {
            int contactId = 0;
            if (!string.IsNullOrWhiteSpace(dto.ContactId))
            {
                if (!int.TryParse(dto.ContactId, out contactId))
                {
                    var newContact = new CrmContact { Name = dto.ContactId, Status = "Cold", Source = "Other", Date = DateTime.Now.ToString("yyyy-MM-dd"), Phone = "-", Email = "-", Address = "-", Project = "-", Tags = "[]" };
                    _db.CrmContacts.Add(newContact);
                    await _db.SaveChangesAsync();
                    contactId = newContact.Id;
                }
            }

            string dealDate = !string.IsNullOrWhiteSpace(dto.CloseDate) ? dto.CloseDate : DateTime.Now.ToString("yyyy-MM-dd");

            // Prevent duplicate initial zero-value lead deals for the same contact
            if (contactId > 0 && (dto.Stage ?? "LEAD") == "LEAD" && dto.Value == 0)
            {
                var existingEmptyDeal = await _db.Deals
                    .FirstOrDefaultAsync(d => d.ContactId == contactId && d.Stage == "LEAD" && d.Value == 0);
                if (existingEmptyDeal != null)
                {
                    existingEmptyDeal.Title = dto.Title ?? existingEmptyDeal.Title;
                    existingEmptyDeal.CloseDate = dealDate;
                    await _db.SaveChangesAsync();
                    return Ok(new { id = existingEmptyDeal.Id.ToString(), message = "Deal updated" });
                }
            }

            var deal = new Deal
            {
                Title = dto.Title,
                Value = dto.Value,
                ContactId = contactId,
                Stage = dto.Stage ?? "LEAD",
                CloseDate = dealDate
            };
            _db.Deals.Add(deal);
            await _db.SaveChangesAsync();
            return Ok(new { id = deal.Id.ToString(), message = "Deal created" });
        }

        // PUT /api/crm/deals/{id}
        [HttpPut("deals/{id}")]
        public async Task<IActionResult> UpdateDeal(int id, [FromBody] DealDto dto)
        {
            var deal = await _db.Deals.FindAsync(id);
            if (deal == null) return NotFound();

            deal.Title = dto.Title;
            deal.Value = dto.Value;
            deal.Stage = dto.Stage ?? deal.Stage;
            deal.CloseDate = dto.CloseDate;
            
            if (!string.IsNullOrWhiteSpace(dto.ContactId))
            {
                if (!int.TryParse(dto.ContactId, out int contactId))
                {
                    var newContact = new CrmContact { Name = dto.ContactId, Status = "Cold", Source = "Other", Date = DateTime.Now.ToString("yyyy-MM-dd"), Phone = "-", Email = "-", Address = "-", Project = "-", Tags = "[]" };
                    _db.CrmContacts.Add(newContact);
                    await _db.SaveChangesAsync();
                    deal.ContactId = newContact.Id;
                }
                else
                {
                    deal.ContactId = contactId;
                }
            }
            else
            {
                deal.ContactId = 0;
            }

            // Sync with Quotation
            var linkedQuotation = await _db.Quotations.FirstOrDefaultAsync(q => q.DealId == deal.Id);
            if (linkedQuotation != null)
            {
                linkedQuotation.Status = deal.Stage switch {
                    "PROPOSAL" => "Pending",
                    "NEGOTIATION" => "Negotiating",
                    "WON" => "Approved",
                    "LOST" => "Rejected",
                    _ => linkedQuotation.Status
                };
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Deal updated" });
        }

        // DELETE /api/crm/deals/{id}
        [HttpDelete("deals/{id}")]
        public async Task<IActionResult> DeleteDeal(int id)
        {
            var deal = await _db.Deals.FindAsync(id);
            if (deal == null) return NotFound();

            // Remove associated quotations to avoid FK constraints
            var quotes = await _db.Quotations.Where(q => q.DealId == deal.Id).ToListAsync();
            if (quotes.Any()) _db.Quotations.RemoveRange(quotes);

            _db.Deals.Remove(deal);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Deal deleted" });
        }

        // Ã¢â€â‚¬Ã¢â€â‚¬ ACTIVITIES Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

        // GET /api/crm/activities/all
        [HttpGet("activities/all")]
        public async Task<IActionResult> GetActivities()
        {
            var completedActs = await _db.Activities.Where(a => a.Status == "Completed").ToListAsync();
            if (completedActs.Any())
            {
                _db.Activities.RemoveRange(completedActs);
                await _db.SaveChangesAsync();
            }

            var acts = await _db.Activities.ToListAsync();
            var result = acts.Select(a => new
            {
                id = a.Id.ToString(),
                type = a.Type,
                date = a.Date,
                client = a.ClientId,
                status = a.Status,
                notes = a.Notes
            });
            return Ok(result);
        }

        // POST /api/crm/activities
        [HttpPost("activities")]
        public async Task<IActionResult> CreateActivity([FromBody] ActivityDto dto)
        {
            if (dto.Status == "Completed")
            {
                return Ok(new { id = "0", message = "Completed activity is not retained" });
            }

            string clientIdStr = dto.Client;
            if (!string.IsNullOrWhiteSpace(clientIdStr) && !int.TryParse(clientIdStr, out _))
            {
                var newContact = new CrmContact { Name = clientIdStr, Status = "Cold", Source = "Other", Date = DateTime.Now.ToString("yyyy-MM-dd"), Phone = "-", Email = "-", Address = "-", Project = "-", Tags = "[]" };
                _db.CrmContacts.Add(newContact);
                await _db.SaveChangesAsync();
                clientIdStr = newContact.Id.ToString();
            }

            var act = new Activity
            {
                Type = dto.Type,
                Date = dto.Date,
                ClientId = string.IsNullOrWhiteSpace(clientIdStr) ? "0" : clientIdStr,
                Status = dto.Status,
                Notes = dto.Notes ?? ""
            };
            _db.Activities.Add(act);
            await _db.SaveChangesAsync();
            return Ok(new { id = act.Id.ToString(), message = "Activity created" });
        }

        // PUT /api/crm/activities/{id}
        [HttpPut("activities/{id}")]
        public async Task<IActionResult> UpdateActivity(int id, [FromBody] ActivityDto dto)
        {
            var act = await _db.Activities.FindAsync(id);
            if (act == null) return NotFound();

            if (dto.Status == "Completed")
            {
                _db.Activities.Remove(act);
                await _db.SaveChangesAsync();
                return Ok(new { message = "Activity completed and permanently deleted" });
            }

            string clientIdStr = dto.Client;
            if (!string.IsNullOrWhiteSpace(clientIdStr) && !int.TryParse(clientIdStr, out _))
            {
                var newContact = new CrmContact { Name = clientIdStr, Status = "Cold", Source = "Other", Date = DateTime.Now.ToString("yyyy-MM-dd"), Phone = "-", Email = "-", Address = "-", Project = "-", Tags = "[]" };
                _db.CrmContacts.Add(newContact);
                await _db.SaveChangesAsync();
                clientIdStr = newContact.Id.ToString();
            }

            act.Type = dto.Type;
            act.Date = dto.Date;
            act.ClientId = string.IsNullOrWhiteSpace(clientIdStr) ? "0" : clientIdStr;
            act.Status = dto.Status;
            act.Notes = dto.Notes ?? act.Notes;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Activity updated" });
        }

        // DELETE /api/crm/activities/{id}
        [HttpDelete("activities/{id}")]
        public async Task<IActionResult> DeleteActivity(int id)
        {
            var act = await _db.Activities.FindAsync(id);
            if (act == null) return NotFound();

            _db.Activities.Remove(act);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Activity deleted" });
        }
    }
}
