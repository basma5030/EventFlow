namespace Eventflow.Models
{
    public class Watchlist
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int EventId { get; set; }
        public DateTime savedAt { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;
        public Events Event { get; set; } = null!;
    }
}