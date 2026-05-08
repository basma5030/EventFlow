namespace Eventflow.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string Message { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
    }
}