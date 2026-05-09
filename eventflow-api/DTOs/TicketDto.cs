public class TicketDto
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public string EventTitle { get; set; } = string.Empty;
    public string EventVenue { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public double pricePaid { get; set; }
    public string QRCode { get; set; } = string.Empty;
    public string uniqueCode { get; set; } = string.Empty;
    public DateTime PurchaseDate { get; set; }
}