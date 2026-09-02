namespace Blackstone_Interior.models
{
    public class AdminUser
    {
        public int Id { get; set; }
        public string Username { get; set; } = "admin";
        public string Password { get; set; } = "admin123";
        public string Email { get; set; } = "nakul.blackstoneinteriors@gmail.com";
        public string? ResetOtp { get; set; }
        public DateTime? OtpExpiry { get; set; }
    }
}
