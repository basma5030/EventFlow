using Eventflow.Data;
using Eventflow.DTOs;
using Eventflow.Models;
using Eventflow.Models.Enums;
using Microsoft.EntityFrameworkCore;

public class EventService
{
    private readonly AppDbContext _db;
    private readonly FileHelper _fileHelper;

    public EventService(AppDbContext db, FileHelper fileHelper)
    {
        _db = db;
        _fileHelper = fileHelper;
    }

    //Organizer logic: create event, get own events, update event, delete event
   public async Task<EventDto> CreateEventAsync(
    int organizerId,
    CreateEventDto dto)
{
    var organizer = await _db.Users
        .FindAsync(organizerId)
        ?? throw new Exception(
            "Organizer not found.");

    if (!organizer.IsApproved)
        throw new Exception(
            "Organizer account is not approved.");

    var ev = new Events
    {
        organizerId = organizerId,
        Organizer = organizer,
        title = dto.title,
        description = dto.description,
        venue = dto.venue,
        category = dto.category,
        eventDate = dto.eventDate,
        ticketPrice = dto.ticketPrice,
        totalTickets = dto.totalTickets,
        availableTickets = dto.totalTickets, 
        status = EventStatus.pending,
        createdAt = DateTime.UtcNow
    };

    _db.Events.Add(ev);

    await _db.SaveChangesAsync();

    return MapToDto(ev);
}

    public async Task<EventDto> UpdateEventAsync(int eventId,
     int organizerId, CreateEventDto updated)
    {
        var ev = await _db.Events
        .Include(e => e.Organizer)
        .FirstOrDefaultAsync(e => e.id == eventId 
        && e.organizerId == organizerId)
            ?? throw new Exception("Event not found or access denied.");


        ev.title = updated.title;
        ev.description = updated.description;
        ev.venue = updated.venue;
        ev.category = updated.category;
        ev.eventDate = updated.eventDate;
        ev.ticketPrice = updated.ticketPrice;

         // only update ticket count if no tickets sold yet
        var ticketsSold = ev.totalTickets - ev.availableTickets;
        if (updated.totalTickets >= ticketsSold)
        {
            ev.totalTickets     = updated.totalTickets;
            ev.availableTickets = updated.totalTickets - ticketsSold;
        }
        else
        {
            throw new Exception("Total tickets cannot be less than tickets already sold.");
        }
    //  imageUrl = await SaveFileAsync(updated.image),
    //  attachmentUrl = await SaveFileAsync(updated.attachment),

        await _db.SaveChangesAsync();
        return MapToDto(ev);
    }

    public async Task DeleteEventAsync(int id, int organizerId)
    {
        var ev = await _db.Events
            .FirstOrDefaultAsync(e => e.id == id 
            && e.organizerId == organizerId)
            ?? throw new Exception("Event not found or access denied.");

        _db.Events.Remove(ev);
        await _db.SaveChangesAsync();
    }

    public async Task<List<EventDto>> GetApprovedEventsAsync()
    {
        return await _db.Events
            .Include(e => e.Organizer)
            .Where(e => e.status == EventStatus.approved)
            .Select(e => MapToDto(e))
            .ToListAsync();
    }
      public async Task<List<EventDto>> getOrganizerEventsAsync(int organizerId)
    {
        return await _db.Events
        .Include(e => e.Organizer)
        .Where(e => e.organizerId == organizerId)
        .OrderByDescending(e => e.createdAt)
        .Select(e => MapToDto(e))
        .ToListAsync();
    }

    public async Task<List<EventDto>> SearchEventsAsync(
        string? venue,
        string? category,
        DateTime? date)
    {
        var query = _db.Events
            .Where(e => e.status == EventStatus.approved)
            .AsQueryable();

        if (!string.IsNullOrEmpty(venue))
        {
            query = query.Where(e => e.venue.Contains(venue));
        }

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(e => e.category.Contains(category));
        }

        if (date.HasValue)
        {
            query = query.Where(e => e.eventDate.Date == date.Value.Date);
        }

        return await query
            .Include(e => e.Organizer)
            .Select(e => MapToDto(e))
            .ToListAsync();
    }

    //saving photos and attachment logic
   public async Task<EventDto> UploadEventFilesAsync(int organizerId,int eventId,
    IFormFile image, IFormFile attachment)
{
    var ev = await _db.Events
        .FirstOrDefaultAsync(e =>
            e.id == eventId &&
            e.organizerId == organizerId)
        ?? throw new Exception("Event not found or access denied.");

    // upload files (NO DB here)
    if (image != null)
        ev.ImagePath = await _fileHelper
        .SaveFileAsync(image, eventId);

    if (attachment != null)
        ev.AttachmentPath = await _fileHelper
        .SaveFileAsync(attachment, eventId);

    // DB update ONLY here
    await _db.SaveChangesAsync(); 
    return MapToDto(ev);
}
    //model to dto mapping
     public static EventDto MapToDto(Events e) => new()
    {
        id               = e.id,
        organizerName    = e.Organizer?.Name ?? "Unknown",
        title            = e.title,
        description      = e.description,
        venue            = e.venue,
        category         = e.category,
        eventDate        = e.eventDate,
        ticketPrice      = e.ticketPrice,
        totalTickets     = e.totalTickets,
        availableTickets = e.availableTickets,
        imageUrl        = e.ImagePath,
        attachmentUrl   = e.AttachmentPath,
        status           = e.status.ToString(),
        rejectionReason  = e.rejectionReason,
        createdAt        = e.createdAt
    };
}