namespace Eventflow.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }

        public int EventId { get; set; }
        public Events Event { get; set; }

        public int Rating { get; set; }
        public string Comment { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        public User Reviewer { get; set; }
        public Events ReviewedEvent { get; set; }
    }
}