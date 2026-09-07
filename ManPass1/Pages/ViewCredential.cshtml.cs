using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WeRemember.Data;
using WeRemember.Models;
using WeRemember.Services;
using System.Security.Claims;

namespace WeRemember.Pages
{
    [Authorize]
    public class ViewCredentialModel : PageModel
    {
        private readonly AppDbContext _context;
        private readonly PasswordEncryptionService _encryptionService;

        public ViewCredentialModel(
            AppDbContext context,
            PasswordEncryptionService encryptionService)
        {
            _context = context;
            _encryptionService = encryptionService;
        }

        public Credential Credential { get; set; } = new();

        public string DecryptedPassword { get; set; } = "";

        public async Task<IActionResult> OnGetAsync(int id)
        {
            string? userIdValue =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdValue == null)
            {
                return Unauthorized();
            }

            int userId = int.Parse(userIdValue);

            Credential? credential =
                await _context.Credentials
                    .FirstOrDefaultAsync(c =>
                        c.Id == id &&
                        c.UserId == userId);

            if (credential == null)
            {
                return NotFound();
            }

            Credential = credential;

            DecryptedPassword =
                _encryptionService.Decrypt(
                    credential.EncryptedPassword
                );

            return Page();
        }
    }
}