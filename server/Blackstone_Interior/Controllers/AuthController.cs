using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Blackstone_Interior.models;

namespace Blackstone_Interior.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly BlackstoneinteriorDbContext _context;

        public AuthController(BlackstoneinteriorDbContext context)
        {
            _context = context;
        }

        private async Task EnsureAdminExists()
        {
            if (!await _context.AdminUsers.AnyAsync())
            {
                _context.AdminUsers.Add(new AdminUser
                {
                    Username = "admin",
                    Password = "admin123", // Default password
                    Email = "nakul.blackstoneinteriors@gmail.com"
                });
                await _context.SaveChangesAsync();
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            await EnsureAdminExists();
            
            var user = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Username == req.Username && u.Password == req.Password);
            
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            var loginHistory = new LoginHistory
            {
                IpAddress = ip,
                Location = "Local System", // For now
                Status = user != null ? "Success" : "Failed",
                Timestamp = DateTime.UtcNow
            };
            
            _context.LoginHistories.Add(loginHistory);

            if (user == null)
            {
                await _context.SaveChangesAsync();
                return Unauthorized(new { message = "Invalid credentials." });
            }
            
            var activityLog = new SystemActivityLog
            {
                Action = "Admin user logged in",
                Icon = "Key",
                Timestamp = DateTime.UtcNow
            };
            _context.SystemActivityLogs.Add(activityLog);
            await _context.SaveChangesAsync();
            
            // Note: In a real app, generate a JWT token. For this simple ERP, returning success is sufficient since there is no token middleware setup yet.
            return Ok(new { message = "Login successful", username = user.Username, email = user.Email });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
        {
            await EnsureAdminExists();
            
            var user = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null)
            {
                return NotFound(new { message = "Email not found." });
            }

            // Generate 6-digit OTP
            var otp = new Random().Next(100000, 999999).ToString();
            user.ResetOtp = otp;
            user.OtpExpiry = DateTime.UtcNow.AddMinutes(15);
            
            await _context.SaveChangesAsync();

            try 
            {
                var smtpClient = new System.Net.Mail.SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new System.Net.NetworkCredential("nakul.blackstoneinteriors@gmail.com", "YOUR_GMAIL_APP_PASSWORD_HERE"),
                    EnableSsl = true,
                };

                var mailMessage = new System.Net.Mail.MailMessage
                {
                    From = new System.Net.Mail.MailAddress("nakul.blackstoneinteriors@gmail.com"),
                    Subject = "Black Stone ERP - Password Reset OTP",
                    Body = $"Your OTP for resetting the password is: {otp}. It is valid for 15 minutes.",
                    IsBodyHtml = false,
                };
                mailMessage.To.Add(user.Email);

                // smtpClient.Send(mailMessage); // Uncomment this when you add your App Password
                Console.WriteLine($"OTP for {user.Email} is: {otp}");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending email: " + ex.Message);
            }

            return Ok(new { message = "OTP sent successfully to " + user.Email, _dev_otp = otp });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest req)
        {
            var user = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Email == req.Email && u.ResetOtp == req.Otp);
            if (user == null || user.OtpExpiry < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Invalid or expired OTP." });
            }

            // Reset password
            user.Password = req.NewPassword;
            user.ResetOtp = null;
            user.OtpExpiry = null;

            var activityLog = new SystemActivityLog
            {
                Action = "Admin password reset via OTP",
                Icon = "Key",
                Timestamp = DateTime.UtcNow
            };
            _context.SystemActivityLogs.Add(activityLog);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully." });
        }

        [HttpGet("login-history")]
        public async Task<IActionResult> GetLoginHistory()
        {
            var logs = await _context.LoginHistories.OrderByDescending(l => l.Timestamp).Take(50).ToListAsync();
            return Ok(logs);
        }

        [HttpGet("activity-logs")]
        public async Task<IActionResult> GetActivityLogs()
        {
            var logs = await _context.SystemActivityLogs.OrderByDescending(l => l.Timestamp).Take(50).ToListAsync();
            return Ok(logs);
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; }
    }

    public class VerifyOtpRequest
    {
        public string Email { get; set; }
        public string Otp { get; set; }
        public string NewPassword { get; set; }
    }
}
