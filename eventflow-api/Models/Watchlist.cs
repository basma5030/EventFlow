namespace Eventflow.Models
{
    public class Watchlist
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int EventId { get; set; }
        public Events Event { get; set; }

        public DateTime savedAt { get; set; }
    }
}