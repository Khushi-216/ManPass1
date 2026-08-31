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
    public class PersonalDetailsModel : PageModel
    {
        private readonly AppDbContext _context;

        public PersonalDetailsModel(AppDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public string FullName { get; set; } = "";

        [BindProperty]
        public string Email { get; set; } = "";

        [BindProperty]
        public string Phone { get; set; } = "";

        [BindProperty]
        public string Address { get; set; } = "";

        public async Task<IActionResult> OnGetAsync()
        {
            string? userIdValue =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdValue == null)
                return Unauthorized();

            int userId = int.Parse(userIdValue);

            var details = await _context.PersonalDetails
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (details != null)
            {
                FullName = details.FullName;
                Email = details.Email;
                Phone = details.Phone;
                Address = details.Address;
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            string? userIdValue =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdValue == null)
                return Unauthorized();

            int userId = int.Parse(userIdValue);

            var details = await _context.PersonalDetails
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (details == null)
            {
                details = new PersonalDetail
                {
                    UserId = userId
                };

                _context.PersonalDetails.Add(details);
            }

            details.FullName = FullName;
            details.Email = Email;
            details.Phone = Phone;
            details.Address = Address;

            await _context.SaveChangesAsync();

            return RedirectToPage("/PersonalDetails");
        }
    }
}