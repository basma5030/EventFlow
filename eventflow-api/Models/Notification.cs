namespace Eventflow.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public int UserId { get; set; }
        public string Message { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }

        // Navigation properties, 1 event and user have many notf.
        public User User { get; set; } = null!;
        public Events Event { get; set; } = null!;
    }
}