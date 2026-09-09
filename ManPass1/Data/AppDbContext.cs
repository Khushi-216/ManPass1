using Microsoft.EntityFrameworkCore;
using WeRemember.Models;

namespace WeRemember.Data
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
