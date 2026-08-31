namespace ManPass1.Models
{
    public class PersonalDetail
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string FullName { get; set; } = "";

        public string Email { get; set; } = "";

        public string Phone { get; set; } = "";

        public string Address { get; set; } = "";

        public User? User { get; set; }
    }
}