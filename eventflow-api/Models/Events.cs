using Eventflow.Models.Enums;

namespace Eventflow.Models
{
    public class Events
    {
        public int id { get; set; }
        public int organizerId { get; set; }

        public string title { get; set; } = null!;
        public string description { get; set; } = null!;
        public string venue { get; set; } = null!;
        public string category { get; set; } = null!;
        public DateTime eventDate { get; set; }
        public double ticketPrice { get; set; }
        public int totalTickets { get; set; }
        public int availableTickets { get; set; }
        public string? ImagePath { get; set; }
        public string? AttachmentPath { get; set; }
        public EventStatus status { get; set; } = EventStatus.pending;
        public string? rejectionReason { get; set; }
        public DateTime createdAt { get; set; }

        // Navigation properties
        public User Organizer { get; set; } = null!;
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<EventMaterial> Materials { get; set; } = new List<EventMaterial>();
    }
}