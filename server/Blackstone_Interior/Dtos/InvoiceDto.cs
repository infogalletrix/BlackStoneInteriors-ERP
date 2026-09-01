using System.Text.Json;

namespace Blackstone_Interior.Dtos
{
    public class InvoiceDto
    {
        public string? Id { get; set; }
        public string? InvoiceNo { get; set; }
        public string InvoiceDate { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string ClientAddress { get; set; } = string.Empty;
        public string? OrganizationName { get; set; }
        public string? GstNumber { get; set; }
        public string ProjectTitle { get; set; } = string.Empty;
        public string WorkDescription { get; set; } = string.Empty;
        // Accept complex items JSON from frontend as-is
        public JsonElement? Items { get; set; }
        public decimal Total { get; set; }
        public string BillType { get; set; } = "GST";
        public string Status { get; set; } = "Unpaid";
        public string Date { get; set; } = string.Empty;
        
        // Advanced fields
        public string? EmailId { get; set; }
        public string? MobileNo { get; set; }
        public string? DeliveryTimeline { get; set; }
        public decimal? InstallationMaterial { get; set; }
        public decimal? DeliveryLoading { get; set; }
        public decimal? AdditionalDiscount { get; set; }
    }
}
