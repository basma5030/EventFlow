namespace Eventflow.DTOs
{
    public class EventDto
    {
        public int id { get; set; }
        public string organizerName { get; set; } = null!;
        public string title { get; set; } = null!;
        public string description { get; set; } = null!;
        public string venue { get; set; } = null!;
        public string category { get; set; } = null!;
        public DateTime eventDate { get; set; }
        public double ticketPrice { get; set; }
        public int totalTickets { get; set; }
        public int availableTickets { get; set; }
        public string? imageUrl { get; set; } = null!;
        public string? attachmentUrl { get; set; } = null!;
        public string status { get; set; } = null!;
        public string? rejectionReason { get; set; } = null!;
         public DateTime createdAt {get; set;}
    }
}