namespace Eventflow.Models
{
    public class EventMaterial
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string FilePath { get; set; } = null!;
        public string OriginalName { get; set; } = null!;
        public long FileSize { get; set; }
        public string ContentType { get; set; } = null!;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Events Event { get; set; } = null!;
    }
}