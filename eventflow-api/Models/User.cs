using Eventflow.Models.Enums;

namespace Eventflow.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public UserRole Role { get; set; } = UserRole.Participant;
        public DateTime CreatedAt { get; set; }
        public bool IsApproved { get; set; }

        public ICollection<Events> Events { get; set; } = new List<Events>();
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
         public ICollection<Review> Reviews { get; set; }
        = new List<Review>();
        public ICollection<Notification> Notifications { get; set; }
        = new List<Notification>();
        public ICollection<Watchlist> Watchlists { get; set; }
        = new List<Watchlist>();
    }
}