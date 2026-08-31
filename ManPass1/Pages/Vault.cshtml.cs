using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ManPass1.Data;
using ManPass1.Models;
using System.Security.Claims;

namespace ManPass1.Pages
{
    [Authorize]
    public class VaultModel : PageModel
    {
        private readonly AppDbContext _context;

        public VaultModel(AppDbContext context)
        {
            _context = context;
        }

        public List<Credential> Credentials { get; set; } = new();

        [BindProperty(SupportsGet = true)]
        public string SearchTerm { get; set; } = "";


        public async Task OnGetAsync()
        {
            string? userIdValue =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdValue == null)
                return;

            int userId = int.Parse(userIdValue);

            var query = _context.Credentials
                .Where(c => c.UserId == userId);

            if (!string.IsNullOrWhiteSpace(SearchTerm))
            {
                query = query.Where(c =>
                    c.WebsiteName.Contains(SearchTerm) ||
                    c.Username.Contains(SearchTerm));
            }

            Credentials = await query
                .OrderBy(c => c.WebsiteName)
                .ToListAsync();
        }
    }
}