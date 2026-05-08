using Eventflow.Data;
using Eventflow.DTOs;
using Eventflow.Models;
using Eventflow.Models.Enums;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

public class AdminService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<EventFlowHub> _hub;

    public AdminService(AppDbContext db, IHubContext<EventFlowHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    //Account management section
    public async Task<List<UserDto>> GetOrganizerAccountsAsync()
    {
        return await _db.Users
            .Where(u => u.Role == UserRole.Organizer)
            .OrderBy(u => u.IsApproved)
            .ThenBy(u => u.CreatedAt)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Name,
                Email = u.Email,
                Role = u.Role.ToString(),
                IsApproved = u.IsApproved
            })
            .ToListAsync();
    }

    public async Task ApproveOrganizerAsync(int userId)
    {
        var user = await _db.Users
        .FirstOrDefaultAsync(u => u.Id == userId 
        && u.Role == UserRole.Organizer)
        ?? throw new Exception("Organizer not found");

        if (user.IsApproved)
        throw new Exception(
         "Organizer is already approved.");

        user.IsApproved = true;
        await _db.SaveChangesAsync();

        await _hub.Clients.Group($"user-{user.Id}")
        .SendAsync("AccountApproved",
         new { message =  
         "Your organizer account has been approved. You can now create events."});
    }

    public async Task RejectOrganizerAsync(int userId)
    {
        var user = await _db.Users
        .FirstOrDefaultAsync(u => u.Id == userId 
        && u.Role == UserRole.Organizer)
         ?? throw new Exception("Organizer not found");

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
    }

    public async Task<List<EventDto>> GetPendingEventsAsync()
    {
        return await _db.Events
            .Include(e => e.Organizer)
            .Where(e => e.status == EventStatus.pending)
            .OrderBy(e => e.createdAt)
            .Select(e => Map(e))
            .ToListAsync();
    }


//event management section: has get pending events, approve/reject events

    public async Task ApproveEventAsync(int eventId)
    {
        var ev = await _db.Events
        .Include(e => e.Organizer)
        .FirstOrDefaultAsync(e => e.id == eventId 
        && e.status == EventStatus.pending)
            ?? throw new Exception("Pending event not found");

        ev.status = EventStatus.approved;
        await _db.SaveChangesAsync();
    }

    public async Task RejectEventAsync(int eventId, string reason)
    {
        var ev = await _db.Events
        .Include(e => e.Organizer)
        .FirstOrDefaultAsync(e => e.id == eventId 
        && e.status == EventStatus.pending)
        ?? throw new Exception("Pending event not found");

        ev.status = EventStatus.rejected;
        ev.rejectionReason = reason;
        await _db.SaveChangesAsync();
    }

    //method maps event to event dto
    private static EventDto Map(Events e)
    {
        return new EventDto
        {
            id = e.id,
            organizerName    = e.Organizer?.Name ?? "Unknown",
            title = e.title,
            description = e.description,
            venue = e.venue,
            category = e.category,
            eventDate = e.eventDate,
            ticketPrice = e.ticketPrice,
            totalTickets = e.totalTickets,
            availableTickets = e.availableTickets,
            imageUrl = e.ImagePath,
            attachmentUrl = e.AttachmentPath,
            status = e.status.ToString(),
            rejectionReason = e.rejectionReason,
            createdAt        = e.createdAt
        };
    }
}