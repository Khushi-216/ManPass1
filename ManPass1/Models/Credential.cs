using System.ComponentModel.DataAnnotations;

namespace ManPass1.Models
{
    public class Credential
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        [Required]
        public string WebsiteName { get; set; } = "";

        public string WebsiteUrl { get; set; } = "";

        [Required]
        public string Username { get; set; } = "";

        [Required]
        public string EncryptedPassword { get; set; } = "";

        public User? User { get; set; }
    }
}