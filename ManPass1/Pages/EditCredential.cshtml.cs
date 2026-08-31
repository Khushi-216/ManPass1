using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ManPass1.Data;
using ManPass1.Services;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace ManPass1.Pages
{
    [Authorize]
    public class EditCredentialModel : PageModel
    {
        private readonly AppDbContext _context;
        private readonly PasswordEncryptionService _encryptionService;

        public EditCredentialModel(
            AppDbContext context,
            PasswordEncryptionService encryptionService)
        {
            _context = context;
            _encryptionService = encryptionService;
        }

        [BindProperty]
        public int Id { get; set; }

        [BindProperty]
        [Required]
        [Display(Name = "Website Name")]
        public string WebsiteName { get; set; } = "";

        [BindProperty]
        [Display(Name = "Website URL")]
        [Url]
        public string WebsiteUrl { get; set; } = "";

        [BindProperty]
        [Required]
        public string Username { get; set; } = "";

        [BindProperty]
        [Required]
        public string Password { get; set; } = "";


        public async Task<IActionResult> OnGetAsync(int id)
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

            Id = credential.Id;
            WebsiteName = credential.WebsiteName;
            WebsiteUrl = credential.WebsiteUrl;
            Username = credential.Username;

            Password = _encryptionService.Decrypt(
                credential.EncryptedPassword
            );

            return Page();
        }


        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
                return Page();

            string? userIdValue =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdValue == null)
                return Unauthorized();

            int userId = int.Parse(userIdValue);

            var credential = await _context.Credentials
                .FirstOrDefaultAsync(c =>
                    c.Id == Id &&
                    c.UserId == userId);

            if (credential == null)
                return NotFound();

            credential.WebsiteName = WebsiteName;
            credential.WebsiteUrl = WebsiteUrl;
            credential.Username = Username;

            credential.EncryptedPassword =
                _encryptionService.Encrypt(Password);

            await _context.SaveChangesAsync();

            return RedirectToPage("/Vault");
        }
    }
}