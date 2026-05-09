using Eventflow.Data;
using Eventflow.Models;
using Eventflow.Models.Enums;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

public class TicketService
{
    private readonly AppDbContext _db;
    private readonly QrCodeHelper _qr;
    private readonly IHubContext<EventFlowHub> _hub;

    public TicketService(AppDbContext db, QrCodeHelper qr, IHubContext<EventFlowHub> hub)
    {
        _db = db;
        _qr = qr;
        _hub = hub;
    }

    public async Task<TicketDto> purchaseTicketAsync(int userId, int eventId)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            Console.WriteLine($"=== PURCHASE ATTEMPT ===");
            Console.WriteLine($"UserId: {userId}, EventId: {eventId}");
            
            var ev = await _db.Events
                .FirstOrDefaultAsync(e => e.id == eventId);
            
            if (ev == null)
            {
                Console.WriteLine("ERROR: Event not found!");
                throw new Exception("Event not found");
            }
            
            Console.WriteLine($"Event found: {ev.title}, Status: {ev.status}, Available: {ev.availableTickets}");
            
            if (ev.status != EventStatus.approved)
            {
                Console.WriteLine("ERROR: Event not approved!");
                throw new Exception("Event is not approved yet");
            }
            
            if (ev.availableTickets <= 0)
            {
                Console.WriteLine("ERROR: Sold out!");
                throw new Exception("Sorry! This event is sold out.");
            }
            
            var existingTicket = await _db.Tickets
                .AnyAsync(t => t.UserId == userId && t.EventId == eventId);
            
            if (existingTicket)
            {
                Console.WriteLine("ERROR: User already has a ticket!");
                throw new Exception("You have already purchased a ticket for this event.");
            }
            
            var uniqueCode = Guid.NewGuid().ToString();
            var qrBase64 = _qr.GenerateQrCode(uniqueCode);
            
            Console.WriteLine($"QR Code generated: {uniqueCode.Substring(0, 8)}...");
            
            var ticket = new Ticket
            {
                UserId = userId,
                EventId = eventId,
                QRCode = qrBase64,
                UniqueCode = uniqueCode,
                PurchasedAt = DateTime.UtcNow,
                PricePaid = ev.ticketPrice
            };
            
            _db.Tickets.Add(ticket);
            ev.availableTickets--;
            
            var notification = new Notification
            {
                UserId = userId,
                EventId = eventId,
                Message = $"You successfully purchased a ticket for {ev.title}",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            
            _db.Notifications.Add(notification);
            
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
            
            Console.WriteLine("SUCCESS: Ticket purchased!");
            
            // 9. إرسال إشعار فوري للمستخدم عبر SignalR - using User instead of Group
            try
            {
                await _hub.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new
                {
                    Id = Guid.NewGuid().ToString(),
                    Message = $"🎉 You successfully purchased a ticket for {ev.title}!",
                    EventId = ev.id,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                });
                Console.WriteLine($"Notification sent to user {userId} via SignalR");
            }
            catch (Exception hubEx)
            {
                Console.WriteLine($"Hub broadcast error (non-critical): {hubEx.Message}");
            }
            
            // 10. Broadcast تحديث عدد التذاكر للمشاهدين
            try
            {
                await _hub.Clients.Group($"event-{eventId}").SendAsync("TicketCountUpdated", new
                {
                    eventId = ev.id,
                    availableTickets = ev.availableTickets
                });
                Console.WriteLine($"Ticket count update broadcast to event-{eventId} group");
            }
            catch (Exception hubEx)
            {
                Console.WriteLine($"Hub broadcast error (non-critical): {hubEx.Message}");
            }
            
            return await MapToDto(ticket, ev);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            await transaction.RollbackAsync();
            throw;
        }
    }
    
    public async Task<List<TicketDto>> getMyTicketsAsync(int userId)
    {
        var tickets = await _db.Tickets
            .Include(t => t.Events)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.PurchasedAt)
            .ToListAsync();

        var result = new List<TicketDto>();

        foreach (var t in tickets)
            result.Add(await MapToDto(t, t.Events));

        return result;
    }

    public async Task<TicketDto> getTicketByIdAsync(int userId, int ticketId)
    {
        var ticket = await _db.Tickets
            .Include(t => t.Events)
            .FirstOrDefaultAsync(t => t.Id == ticketId && t.UserId == userId)
            ?? throw new Exception("Ticket not found.");

        return await MapToDto(ticket, ticket.Events);
    }

    private static Task<TicketDto> MapToDto(Ticket t, Events ev) =>
        Task.FromResult(new TicketDto
        {
            Id = t.Id,
            EventId = ev.id,
            EventTitle = ev.title,
            EventVenue = ev.venue,
            EventDate = ev.eventDate,
            pricePaid = t.PricePaid,
            QRCode = t.QRCode,
            uniqueCode = t.UniqueCode,
            PurchaseDate = t.PurchasedAt
        });
}