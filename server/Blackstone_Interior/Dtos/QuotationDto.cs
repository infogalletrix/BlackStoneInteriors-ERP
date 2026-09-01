using System.Text.Json;

namespace Blackstone_Interior.Dtos
{
    public class QuotationDto
    {
        public string? Id { get; set; }
        public string? QuoteNo { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string? OrganizationName { get; set; }
        public string ClientAddress { get; set; } = string.Empty;
        public string ProjectTitle { get; set; } = string.Empty;
        public string WorkDescription { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string BillType { get; set; } = "GST";
        // Items come as raw JSON from frontend
        public JsonElement? Items { get; set; }
        public decimal Total { get; set; }
        public string? Status { get; set; }
        public int? DealId { get; set; }
        public string? EmailId { get; set; }
        public string? MobileNo { get; set; }
        public string? CustomerGst { get; set; }
        public string? DeliveryTimeline { get; set; }
        public decimal? InstallationMaterial { get; set; }
        public decimal? DeliveryLoading { get; set; }
        public decimal? AdditionalDiscount { get; set; }
    }
}
