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
        public DbSet<EventMaterial> EventMaterials { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            // Events configuration
            modelBuilder.Entity<Events>()
                .Property(e => e.ticketPrice)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Events>()
                .Property(e => e.status)
                .HasConversion<string>();

            // Relationship: User -> Events (One-to-Many)
            modelBuilder.Entity<Events>()
                .HasOne(e => e.Organizer)
                .WithMany(u => u.Events)
                .HasForeignKey(e => e.organizerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Ticket configuration
            modelBuilder.Entity<Ticket>()
                .Property(t => t.PricePaid)
                .HasPrecision(10, 2);

            // Relationship: User -> Tickets
            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.User)
                .WithMany(u => u.Tickets)
                .HasForeignKey(t => t.UserId);

            // Relationship: Event -> Tickets
            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Events)
                .WithMany(e => e.Tickets)
                .HasForeignKey(t => t.EventId);

            // Review configuration
            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.UserId, r.EventId })
                .IsUnique();

            // Relationship: User -> Reviews
            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId);

            // Relationship: Event -> Reviews
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Event)
                .WithMany(e => e.Reviews)
                .HasForeignKey(r => r.EventId);

            // Watchlist configuration
            modelBuilder.Entity<Watchlist>()
                .HasIndex(w => new { w.UserId, w.EventId })
                .IsUnique();

            // Relationship: User -> Watchlist
            modelBuilder.Entity<Watchlist>()
                .HasOne(w => w.User)
                .WithMany(u => u.Watchlists)
                .HasForeignKey(w => w.UserId);

            // Relationship: Event -> Watchlist
            modelBuilder.Entity<Watchlist>()
                .HasOne(w => w.Event)
                .WithMany()
                .HasForeignKey(w => w.EventId);

            // Notification configuration
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Event)
                .WithMany()
                .HasForeignKey(n => n.EventId);
                modelBuilder.Entity<EventMaterial>()
    .HasOne(m => m.Event)
    .WithMany(e => e.Materials)
    .HasForeignKey(m => m.EventId)
    .OnDelete(DeleteBehavior.Cascade);
        }
    }
}