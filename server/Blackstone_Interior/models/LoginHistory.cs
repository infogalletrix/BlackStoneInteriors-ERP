using System;
using System.ComponentModel.DataAnnotations;

namespace Blackstone_Interior.models
{
    public class LoginHistory
    {
        public int Id { get; set; }
        
        public string IpAddress { get; set; } = string.Empty;
        
        public string Location { get; set; } = string.Empty;
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        public string Status { get; set; } = "Success"; // Success, Failed
    }
}
