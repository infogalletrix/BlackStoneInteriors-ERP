using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Blackstone_Interior.models
{
    public class Quotation
    {
        public int Id { get; set; }
        
        public string QuoteNo { get; set; } = string.Empty;

        [Required]
        public string ClientName { get; set; } = string.Empty;

        public string OrganizationName { get; set; } = string.Empty;

        public string ClientAddress { get; set; } = string.Empty;

        public string ProjectTitle { get; set; } = string.Empty;
        public string WorkDescription { get; set; } = string.Empty;

        public string Date { get; set; } = string.Empty;

        // "GST" | "Non-GST"
        public string BillType { get; set; } = "GST";

        // Items stored as JSON string Ã¢â‚¬â€ serialized list of line items
        [Column(TypeName = "longtext")]
        public string Items { get; set; } = "[]";

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        // Added for CRM Pipeline syncing
        public string Status { get; set; } = "Pending";
        public int? DealId { get; set; }

        // New advanced quotation fields
        public string EmailId { get; set; } = string.Empty;
        public string MobileNo { get; set; } = string.Empty;
        public string CustomerGst { get; set; } = string.Empty;
        public string DeliveryTimeline { get; set; } = string.Empty;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal InstallationMaterial { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal DeliveryLoading { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal AdditionalDiscount { get; set; }
    }
}
