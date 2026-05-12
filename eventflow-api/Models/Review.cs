namespace Eventflow.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int EventId { get; set; }

        public int Rating { get; set; }
        public string Comment { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        // Navigation properties, many reviews per event and user
        public User User { get; set; } = null!;
        public Events Event { get; set; } = null!;
    }
}