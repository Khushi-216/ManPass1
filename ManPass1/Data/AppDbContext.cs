using Microsoft.EntityFrameworkCore;
using ManPass1.Models;

namespace ManPass1.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Credential> Credentials { get; set; }
    }
}