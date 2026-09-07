using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WeRemember.Data;
using WeRemember.Models;
using System.Security.Claims;

namespace WeRemember.Pages
{
    [Authorize]
    public class DeleteCredentialModel : PageModel
    {
        private readonly AppDbContext _context;

        public DeleteCredentialModel(AppDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public int Id { get; set; }

        public Credential Credential { get; set; } = new();


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

            Credential = credential;
            Id = credential.Id;

            return Page();
        }


        public async Task<IActionResult> OnPostAsync()
        {
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

            _context.Credentials.Remove(credential);

            await _context.SaveChangesAsync();

            return RedirectToPage("/Vault");
        }
    }
}