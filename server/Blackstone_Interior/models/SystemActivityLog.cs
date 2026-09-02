using System;
using System.ComponentModel.DataAnnotations;

namespace Blackstone_Interior.models
{
    public class SystemActivityLog
    {
        public int Id { get; set; }
        
        [Required]
        public string Action { get; set; } = string.Empty;
        
        [Required]
        public string Icon { get; set; } = "Activity"; // Activity, Settings, User, Key, etc.

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
