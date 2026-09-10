using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Blackstone_Interior.Dtos;
using Blackstone_Interior.models;
using System.Text.Json;

namespace Blackstone_Interior.Controllers
{
    [ApiController]
    [Route("api/quotations")]
    public class QuotationsController : ControllerBase
    {
        private readonly BlackstoneinteriorDbContext _db;
        public QuotationsController(BlackstoneinteriorDbContext db) => _db = db;

        // Shared helper: compute next serial for YY-MM-XXXX within current month
        private int ComputeNextQuoteSerial(DateTime date)
        {
            string yy = date.ToString("yy");
            string mm = date.ToString("MM");
            string dd = date.ToString("dd");
            string datePrefix = $"BSI-{dd}{mm}{yy}-";
            string legacyPrefix = $"QT-{dd}{mm}{yy}-";

            var currentMonthNums = _db.Quotations
                .Where(q => q.QuoteNo != null && (q.QuoteNo.StartsWith(datePrefix) || q.QuoteNo.StartsWith(legacyPrefix)))
                .Select(q => q.QuoteNo)
                .AsEnumerable()
                .Select(qno =>
                {
                    var parts = qno!.Split('-');
                    return parts.Length == 3 && int.TryParse(parts[2], out int n) ? n : 0;
                })
                .ToList();

            int maxSerial = currentMonthNums.Count > 0 ? currentMonthNums.Max() : 0;
            return maxSerial >= 9999 ? 1 : maxSerial + 1;
        }

        // GET /api/quotations/next-number  (preview only Ã¢â‚¬â€ does NOT reserve a number)
        [HttpGet("next-number")]
        public IActionResult GetNextQuoteNumber([FromQuery] string date = null)
        {
            DateTime parsedDate = DateTime.Now;
            if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out DateTime d))
            {
                parsedDate = d;
            }
            string yy = parsedDate.ToString("yy");
            string mm = parsedDate.ToString("MM");
            string dd = parsedDate.ToString("dd");
            int next = ComputeNextQuoteSerial(parsedDate);
            return Ok(new { nextNumber = $"BSI-{dd}{mm}{yy}-{next:D4}" });
        }

        // GET /api/quotations
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Auto-reconcile orphan "Approved" quotations whose work order (Site) was deleted
            var approvedQuotes = await _db.Quotations
                .Where(q => q.Status == "Approved")
                .ToListAsync();

            if (approvedQuotes.Any())
            {
                var allSites = await _db.Sites.ToListAsync();
                bool anyChanged = false;

                foreach (var q in approvedQuotes)
                {
                    string qClient = (q.ClientName ?? "").Trim().ToLower();
                    string qProject = (q.ProjectTitle ?? "").Trim().ToLower();

                    bool siteExists = allSites.Any(s =>
                    {
                        if (!string.IsNullOrWhiteSpace(s.WorkHistory) && s.WorkHistory.Contains($"\"quotationId\":\"{q.Id}\""))
                            return true;
                        if (!string.IsNullOrWhiteSpace(s.WorkHistory) && s.WorkHistory.Contains($"\"quotationId\":{q.Id}"))
                            return true;

                        string sClient = (s.ClientName ?? "").Trim().ToLower();
                        string sName = (s.Name ?? "").Trim().ToLower();

                        if (!string.IsNullOrWhiteSpace(sClient) && sClient == qClient)
                        {
                            if (!string.IsNullOrWhiteSpace(qProject) && (sName.Contains(qProject) || qProject.Contains(sName)))
                                return true;
                            if (s.Budget == q.Total && q.Total > 0)
                                return true;
                        }
                        return false;
                    });

                    if (!siteExists)
                    {
                        q.Status = "Pending";
                        if (q.DealId.HasValue)
                        {
                            var deal = await _db.Deals.FindAsync(q.DealId.Value);
                            if (deal != null && deal.Stage == "WON")
                            {
                                deal.Stage = "PROPOSAL";
                            }
                        }
                        anyChanged = true;
                    }
                }

                if (anyChanged)
                {
                    await _db.SaveChangesAsync();
                }
            }

            var quotations = await _db.Quotations.ToListAsync();
            var result = quotations.Select(q => new
            {
                id = q.Id.ToString(),
                quoteNo = q.QuoteNo,
                clientName = q.ClientName,
                organizationName = q.OrganizationName,
                clientAddress = q.ClientAddress,
                projectTitle = q.ProjectTitle,
                workDescription = q.WorkDescription,
                date = q.Date,
                billType = q.BillType,
                items = JsonSerializer.Deserialize<JsonElement>(q.Items ?? "[]"),
                total = q.Total,
                status = q.Status,
                dealId = q.DealId,
                emailId = q.EmailId,
                mobileNo = q.MobileNo,
                customerGst = q.CustomerGst,
                deliveryTimeline = q.DeliveryTimeline,
                installationMaterial = q.InstallationMaterial,
                deliveryLoading = q.DeliveryLoading,
                additionalDiscount = q.AdditionalDiscount
            });
            return Ok(result);
        }

        // POST /api/quotations
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] QuotationDto dto)
        {
            // Auto-generate quote number at save time to prevent gaps from abandoned drafts
            string assignedNo = dto.QuoteNo;
            DateTime parsedDate = DateTime.Now;
            if (!string.IsNullOrEmpty(dto.Date) && DateTime.TryParse(dto.Date, out DateTime d))
            {
                parsedDate = d;
            }

            if (string.IsNullOrWhiteSpace(assignedNo))
            {
                string yy = parsedDate.ToString("yy");
                string mm = parsedDate.ToString("MM");
                string dd = parsedDate.ToString("dd");
                int next = ComputeNextQuoteSerial(parsedDate);
                assignedNo = $"BSI-{dd}{mm}{yy}-{next:D4}";
            }

            // Try to find a matching CrmContact
            var clientName = (dto.ClientName ?? "").Trim();
            var contact = await _db.CrmContacts.FirstOrDefaultAsync(c => c.Name.ToLower() == clientName.ToLower());
            if (contact == null)
            {
                contact = new CrmContact
                {
                    Name = clientName,
                    OrganizationName = dto.OrganizationName ?? "",
                    Phone = dto.MobileNo ?? "",
                    Email = dto.EmailId ?? "",
                    Address = dto.ClientAddress ?? "",
                    Project = dto.ProjectTitle ?? "",
                    Status = "Cold",
                    Source = "Quotation",
                    Date = DateTime.Now.ToString("yyyy-MM-dd")
                };
                _db.CrmContacts.Add(contact);
                await _db.SaveChangesAsync(); // save to get Id
            }
            else
            {
                // Update empty contact fields if provided in the quotation
                if (string.IsNullOrWhiteSpace(contact.Phone) && !string.IsNullOrWhiteSpace(dto.MobileNo)) contact.Phone = dto.MobileNo;
                if (string.IsNullOrWhiteSpace(contact.Email) && !string.IsNullOrWhiteSpace(dto.EmailId)) contact.Email = dto.EmailId;
                if (string.IsNullOrWhiteSpace(contact.Address) && !string.IsNullOrWhiteSpace(dto.ClientAddress)) contact.Address = dto.ClientAddress;
                if (string.IsNullOrWhiteSpace(contact.Project) && !string.IsNullOrWhiteSpace(dto.ProjectTitle)) contact.Project = dto.ProjectTitle;
                if (string.IsNullOrWhiteSpace(contact.OrganizationName) && !string.IsNullOrWhiteSpace(dto.OrganizationName)) contact.OrganizationName = dto.OrganizationName;
                await _db.SaveChangesAsync();
            }

            string dealTitle = !string.IsNullOrWhiteSpace(dto.ProjectTitle)
                ? $"{dto.ProjectTitle.Trim()} ({assignedNo})"
                : $"{contact.Name} ({assignedNo})";

            // Check if this contact already has an initial deal in LEAD or CONTACTED stage to advance
            var existingDeal = await _db.Deals
                .Where(d => d.ContactId == contact.Id && (d.Stage == "LEAD" || d.Stage == "CONTACTED"))
                .OrderByDescending(d => d.Id)
                .FirstOrDefaultAsync();

            string quoteDate = !string.IsNullOrWhiteSpace(dto.Date) ? dto.Date : DateTime.Now.ToString("yyyy-MM-dd");

            Deal deal;
            if (existingDeal != null)
            {
                // Advance the existing deal to PROPOSAL
                deal = existingDeal;
                deal.Title = dealTitle;
                deal.Value = dto.Total;
                deal.Stage = "PROPOSAL";
                deal.CloseDate = quoteDate;
            }
            else
            {
                // Check if there is an unlinked PROPOSAL deal for this contact
                var unlinkedProposalDeal = await _db.Deals
                    .Where(d => d.ContactId == contact.Id && d.Stage == "PROPOSAL" && !_db.Quotations.Any(q => q.DealId == d.Id))
                    .OrderByDescending(d => d.Id)
                    .FirstOrDefaultAsync();

                if (unlinkedProposalDeal != null)
                {
                    deal = unlinkedProposalDeal;
                    deal.Title = dealTitle;
                    deal.Value = dto.Total;
                    deal.CloseDate = quoteDate;
                }
                else
                {
                    deal = new Deal
                    {
                        Title = dealTitle,
                        Value = dto.Total,
                        ContactId = contact.Id,
                        Stage = "PROPOSAL",
                        CloseDate = quoteDate
                    };
                    _db.Deals.Add(deal);
                }
            }
            await _db.SaveChangesAsync();

            // Clean up any remaining obsolete 0-value LEAD deals for this contact so only one active card exists
            var staleLeadDeals = await _db.Deals
                .Where(d => d.ContactId == contact.Id && d.Id != deal.Id && d.Stage == "LEAD" && d.Value == 0)
                .ToListAsync();
            if (staleLeadDeals.Any())
            {
                _db.Deals.RemoveRange(staleLeadDeals);
                await _db.SaveChangesAsync();
            }

            var q = new Quotation
            {
                QuoteNo = assignedNo,
                ClientName = dto.ClientName,
                OrganizationName = dto.OrganizationName ?? "",
                ClientAddress = dto.ClientAddress,
                ProjectTitle = dto.ProjectTitle,
                WorkDescription = dto.WorkDescription,
                Date = string.IsNullOrEmpty(dto.Date) ? DateTime.Now.ToString("yyyy-MM-dd") : dto.Date,
                BillType = dto.BillType,
                Items = dto.Items.HasValue ? dto.Items.Value.GetRawText() : "[]",
                Total = dto.Total,
                Status = "Pending",
                DealId = deal.Id,
                EmailId = dto.EmailId ?? "",
                MobileNo = dto.MobileNo ?? "",
                CustomerGst = dto.CustomerGst ?? "",
                DeliveryTimeline = dto.DeliveryTimeline ?? "",
                InstallationMaterial = dto.InstallationMaterial ?? 0,
                DeliveryLoading = dto.DeliveryLoading ?? 0,
                AdditionalDiscount = dto.AdditionalDiscount ?? 0
            };
            _db.Quotations.Add(q);
            _db.SystemActivityLogs.Add(new SystemActivityLog
            {
                Action = $"Created Quotation {assignedNo} for {dto.ClientName ?? "Client"} (₹{dto.Total:N0})",
                Icon = "FileText",
                Timestamp = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
            return Ok(new { id = q.Id.ToString(), quoteNo = q.QuoteNo, message = "Quotation saved" });
        }

        // PUT /api/quotations/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] QuotationDto dto)
        {
            var q = await _db.Quotations.FindAsync(id);
            if (q == null)
            {
                // Auto-upsert: if quote ID not found in database, create new record
                return await Create(dto);
            }

            q.QuoteNo = dto.QuoteNo;
            q.ClientName = dto.ClientName;
            q.OrganizationName = dto.OrganizationName ?? q.OrganizationName;
            q.ClientAddress = dto.ClientAddress;
            q.ProjectTitle = dto.ProjectTitle;
            q.WorkDescription = dto.WorkDescription;
            q.Date = dto.Date;
            q.BillType = dto.BillType;
            q.Items = dto.Items.HasValue ? dto.Items.Value.GetRawText() : q.Items;
            q.Total = dto.Total;
            if (dto.Status != null) {
                q.Status = dto.Status;
            }
            if (dto.EmailId != null) q.EmailId = dto.EmailId;
            if (dto.MobileNo != null) q.MobileNo = dto.MobileNo;
            if (dto.CustomerGst != null) q.CustomerGst = dto.CustomerGst;
            if (dto.DeliveryTimeline != null) q.DeliveryTimeline = dto.DeliveryTimeline;
            if (dto.InstallationMaterial.HasValue) q.InstallationMaterial = dto.InstallationMaterial.Value;
            if (dto.DeliveryLoading.HasValue) q.DeliveryLoading = dto.DeliveryLoading.Value;
            if (dto.AdditionalDiscount.HasValue) q.AdditionalDiscount = dto.AdditionalDiscount.Value;

            // Sync with Deal
            if (q.DealId.HasValue)
            {
                var deal = await _db.Deals.FindAsync(q.DealId.Value);
                if (deal != null)
                {
                    deal.Value = dto.Total;
                    deal.Title = $"{dto.ProjectTitle} ({q.QuoteNo})";
                    deal.Stage = q.Status switch {
                        "Pending" => "PROPOSAL",
                        "Negotiating" => "NEGOTIATION",
                        "Approved" => "WON",
                        "Rejected" => "LOST",
                        _ => deal.Stage
                    };
                }
            }

            _db.SystemActivityLogs.Add(new SystemActivityLog
            {
                Action = $"Updated Quotation {dto.QuoteNo} ({dto.ClientName ?? "Client"})",
                Icon = "FileText",
                Timestamp = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            return Ok(new { id = q.Id.ToString(), quoteNo = q.QuoteNo, message = "Quotation updated" });
        }

        // DELETE /api/quotations/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var q = await _db.Quotations.FindAsync(id);
            if (q == null) return NotFound();

            // Revert linked deal to LEAD if this was its only quotation
            if (q.DealId.HasValue)
            {
                var deal = await _db.Deals.FindAsync(q.DealId.Value);
                if (deal != null)
                {
                    var otherQuotes = await _db.Quotations.AnyAsync(otherQ => otherQ.Id != q.Id && otherQ.DealId == deal.Id);
                    if (!otherQuotes)
                    {
                        deal.Stage = "LEAD";
                        deal.Value = 0;
                        if (deal.Title.Contains("("))
                        {
                            deal.Title = deal.Title.Substring(0, deal.Title.IndexOf("(")).Trim();
                        }
                    }
                }
            }

            _db.Quotations.Remove(q);
            _db.SystemActivityLogs.Add(new SystemActivityLog
            {
                Action = $"Deleted Quotation {q.QuoteNo}",
                Icon = "Trash2",
                Timestamp = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
            return Ok(new { message = "Quotation deleted" });
        }
    }
}
