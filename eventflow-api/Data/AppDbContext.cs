using Eventflow.Models;
using Microsoft.EntityFrameworkCore;

namespace Eventflow.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Events> Events { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Watchlist> Watchlist { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<Events>()
                .Property(e => e.ticketPrice)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Events>()
                .Property(e => e.status)
                .HasConversion<string>();

            modelBuilder.Entity<Ticket>()
                .Property(t => t.PricePaid)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Watchlist>()
                .HasIndex(w => new { w.UserId, w.EventId })
                .IsUnique();

            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.UserId, r.EventId })
                .IsUnique();
        }
    }
}