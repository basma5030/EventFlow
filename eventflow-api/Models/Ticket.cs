namespace Eventflow.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public int UserId { get; set; }

        public DateTime PurchasedAt { get; set; }
        public string QRCode { get; set; } = null!;
        public string UniqueCode { get; set; } = null!;
        public double PricePaid { get; set; }
        // Navigation properties, many tickets per event and user
        public User User { get; set; } = null!;
        public Events Events { get; set; } = null!;
    }
}