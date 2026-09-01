using System.Text.Json;

namespace Blackstone_Interior.Dtos
{
    public class SiteDto
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? ClientName { get; set; }
        public string? Phone { get; set; }
        public string? OrganizationName { get; set; }
        public string? AssignedTeam { get; set; }
        public string? Address { get; set; }
        public string? Status { get; set; }
        public string? StartDate { get; set; }
        public decimal Budget { get; set; }
        public string? Description { get; set; }
        public bool IsNegotiated { get; set; }
        public string? NegotiationDetails { get; set; }
        public bool IsArchived { get; set; }
        public JsonElement? WorkHistory { get; set; }
        public JsonElement? Maintenance { get; set; }
        public JsonElement? Media { get; set; }
        public string? SurveyNotes { get; set; }
        public string? SurveyStatus { get; set; }
        public string? SurveyDate { get; set; }
    }
}
