namespace Eventflow.DTOs
{
    public class ReviewDto
    {
        public int Id { get; set; }

        public int EventId { get; set; }

        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}
