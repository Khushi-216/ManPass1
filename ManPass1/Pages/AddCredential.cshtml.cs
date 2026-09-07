using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using WeRemember.Data;
using WeRemember.Models;
using WeRemember.Services;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace WeRemember.Pages
{
    [Authorize]
    public class AddCredentialModel : PageModel
    {
        private readonly AppDbContext _context;
        private readonly PasswordEncryptionService _encryptionService;

        public AddCredentialModel(
            AppDbContext context,
            PasswordEncryptionService encryptionService)
        {
            _context = context;
            _encryptionService = encryptionService;
        }


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


        public void OnGet()
        {
        }


        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }


            string? userIdValue =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdValue == null)
            {
                return Unauthorized();
            }


            int userId = int.Parse(userIdValue);


            string encryptedPassword =
                _encryptionService.Encrypt(Password);


            Credential credential = new Credential
            {
                UserId = userId,
                WebsiteName = WebsiteName,
                WebsiteUrl = WebsiteUrl,
                Username = Username,
                EncryptedPassword = encryptedPassword
            };


            _context.Credentials.Add(credential);

            await _context.SaveChangesAsync();


            return RedirectToPage("/Vault");
        }
    }
}