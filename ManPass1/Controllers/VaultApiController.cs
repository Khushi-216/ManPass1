using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ManPass1.Data;
using ManPass1.Services;
using System.Security.Claims;

namespace ManPass1.Controllers
{
    [ApiController]
    [Route("api/vault")]
    [Authorize]
    public class VaultApiController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordEncryptionService _encryptionService;

        public VaultApiController(
            AppDbContext context,
            PasswordEncryptionService encryptionService)
        {
            _context = context;
            _encryptionService = encryptionService;
        }

        [HttpGet("credentials")]
        public async Task<IActionResult> GetCredentials()
        {
            string? userIdValue =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdValue == null)
                return Unauthorized();

            int userId = int.Parse(userIdValue);

            var credentials = await _context.Credentials
                .Where(c => c.UserId == userId)
                .Select(c => new
                {
                    c.Id,
                    c.WebsiteName,
                    c.WebsiteUrl,
                    c.Username
                })
                .ToListAsync();

            return Ok(credentials);
        }

        [HttpGet("credential/{id}")]
        public async Task<IActionResult> GetCredential(int id)
        {
            string? userIdValue =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdValue == null)
                return Unauthorized();

            int userId = int.Parse(userIdValue);

            var credential = await _context.Credentials
                .FirstOrDefaultAsync(c =>
                    c.Id == id &&
                    c.UserId == userId);

            if (credential == null)
                return NotFound();

            return Ok(new
            {
                credential.Id,
                credential.WebsiteName,
                credential.WebsiteUrl,
                credential.Username,
                Password = _encryptionService.Decrypt(
                    credential.EncryptedPassword
                )
            });
        }
    }
}