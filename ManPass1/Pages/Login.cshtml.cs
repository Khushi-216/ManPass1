using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ManPass1.Data;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace ManPass1.Pages
{
    public class LoginModel : PageModel
    {
        private readonly AppDbContext _context;

        public LoginModel(AppDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        [Required]
        [EmailAddress]
        public string Email { get; set; } = "";

        [BindProperty]
        [Required]
        public string Password { get; set; } = "";

        [BindProperty(SupportsGet = true)]
        public string? ReturnUrl { get; set; }
        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == Email);

            if (user == null)
            {
                ModelState.AddModelError(
                    string.Empty,
                    "Invalid email or password."
                );

                return Page();
            }

            bool passwordCorrect =
                BCrypt.Net.BCrypt.Verify(
                    Password,
                    user.PasswordHash
                );

            if (!passwordCorrect)
            {
                ModelState.AddModelError(
                    string.Empty,
                    "Invalid email or password."
                );

                return Page();
            }

            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()
                ),

                new Claim(
                    ClaimTypes.Name,
                    user.Name
                ),

                new Claim(
                    ClaimTypes.Email,
                    user.Email
                )
            };

            var identity = new ClaimsIdentity(
                claims,
                CookieAuthenticationDefaults.AuthenticationScheme
            );

            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal
            );
            if (!string.IsNullOrEmpty(ReturnUrl) &&
            Url.IsLocalUrl(ReturnUrl))
            {
                return LocalRedirect(ReturnUrl);
            }

            return RedirectToPage("/Vault");
        }
    }
}