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
            string datePrefix = $"QT-{dd}{mm}{yy}-";

            var currentMonthNums = _db.Quotations
                .Where(q => q.QuoteNo != null && q.QuoteNo.StartsWith(datePrefix))
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
            return Ok(new { nextNumber = $"QT-{dd}{mm}{yy}-{next:D4}" });
        }

        // GET /api/quotations
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
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
                assignedNo = $"QT-{dd}{mm}{yy}-{next:D4}";
            }

            // Try to find a matching CrmContact
            var contact = await _db.CrmContacts.FirstOrDefaultAsync(c => c.Name == dto.ClientName);
            if (contact == null)
            {
                contact = new CrmContact { Name = dto.ClientName, Status = "Cold", Source = "Other", Date = DateTime.Now.ToString("yyyy-MM-dd") };
                _db.CrmContacts.Add(contact);
                await _db.SaveChangesAsync(); // save to get Id
            }

            // Create linked Deal
            var deal = new Deal
            {
                Title = $"{dto.ProjectTitle} ({assignedNo})",
                Value = dto.Total,
                ContactId = contact.Id,
                Stage = "PROPOSAL",
                CloseDate = DateTime.Now.AddDays(30).ToString("yyyy-MM-dd")
            };
            _db.Deals.Add(deal);
            await _db.SaveChangesAsync();

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
            await _db.SaveChangesAsync();
            return Ok(new { id = q.Id.ToString(), quoteNo = q.QuoteNo, message = "Quotation saved" });
        }

        // PUT /api/quotations/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] QuotationDto dto)
        {
            var q = await _db.Quotations.FindAsync(id);
            if (q == null) return NotFound();

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

            await _db.SaveChangesAsync();
            return Ok(new { id = q.Id.ToString(), quoteNo = q.QuoteNo, message = "Quotation updated" });
        }

        // DELETE /api/quotations/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var q = await _db.Quotations.FindAsync(id);
            if (q == null) return NotFound();
            _db.Quotations.Remove(q);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Quotation deleted" });
        }
    }
}
