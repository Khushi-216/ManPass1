using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WeRemember.Data;
using WeRemember.Models;
using System.ComponentModel.DataAnnotations;

namespace WeRemember.Pages
{
    public class RegisterModel : PageModel
    {
        private readonly AppDbContext _context;
        public RegisterModel(AppDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        [Required]
        public string Name { get; set; } = "";

        [BindProperty]
        [Required]
        [EmailAddress]
        public string Email { get; set; } = "";

        [BindProperty]
        [Required]
        [MinLength(8)]
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

            bool emailExists = await _context.Users
                .AnyAsync(user => user.Email == Email);

            if (emailExists)
            {
                ModelState.AddModelError("Email", "An account with this email already exists.");
                return Page();
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(Password);

            User newUser = new User
            {
                Name = Name,
                Email = Email,
                PasswordHash = passwordHash
            };

            _context.Users.Add(newUser);

            await _context.SaveChangesAsync();

            return RedirectToPage("/Index");
        }
    }
}
