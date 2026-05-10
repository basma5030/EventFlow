using Eventflow.Data;
using Eventflow.DTOs;
using Eventflow.Exceptions;
using Eventflow.Models;
using Eventflow.Models.Enums;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

public class EventService
{
    private readonly AppDbContext _db;
    private readonly FileHelper _fileHelper;
    private readonly IWebHostEnvironment _env;
    private readonly IHubContext<EventFlowHub> _hub;

    public EventService(AppDbContext db, FileHelper fileHelper,
     IWebHostEnvironment env, IHubContext<EventFlowHub> hub)
    {
        _db = db;
        _fileHelper = fileHelper;
        _env = env;
        _hub = hub;
    }

    public async Task<EventDto> CreateEventAsync(int organizerId, CreateEventDto dto)
    {
        var organizer = await _db.Users.FindAsync(organizerId)
            ?? throw new NotFoundException("Organizer not found.");

        if (!organizer.IsApproved)
            throw new ForbiddenException("Organizer account is not approved.");

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

    public async Task<EventDto> UpdateEventAsync(int eventId, int organizerId, CreateEventDto updated)
    {
        var ev = await _db.Events
            .Include(e => e.Organizer)
            .FirstOrDefaultAsync(e => e.id == eventId && e.organizerId == organizerId)
            ?? throw new NotFoundException("Event not found or access denied.");

        // Save old values

        var oldTitle = ev.title;
        var oldDate = ev.eventDate;
        var oldVenue = ev.venue;
        var oldPrice = ev.ticketPrice;
        var oldCategory = ev.category;

        //The edits
        
        ev.title = updated.title;
        ev.description = updated.description;
        ev.venue = updated.venue;
        ev.category = updated.category;
        ev.eventDate = updated.eventDate;
        ev.ticketPrice = updated.ticketPrice;

        var ticketsSold = ev.totalTickets - ev.availableTickets;
        if (updated.totalTickets >= ticketsSold)
        {
            ev.totalTickets = updated.totalTickets;
            ev.availableTickets = updated.totalTickets - ticketsSold;
        }
        else
        {
            throw new ValidationException("Total tickets cannot be less than tickets already sold.");
        }

        await _db.SaveChangesAsync();

        // Edit message list.
        var changes = new List<string>();

        if (oldTitle != updated.title)
            changes.Add($"title changed from '{oldTitle}' to '{updated.title}'");

        if (oldDate != updated.eventDate)
            changes.Add($"date changed from '{oldDate:yyyy-MM-dd HH:mm}' to '{updated.eventDate:yyyy-MM-dd HH:mm}'");

        if (oldVenue != updated.venue)
            changes.Add($"venue changed from '{oldVenue}' to '{updated.venue}'");

        if (oldPrice != updated.ticketPrice)
            changes.Add($"price changed from '{oldPrice:C}' to '{updated.ticketPrice:C}'");

        if (oldCategory != updated.category)
            changes.Add($"category changed from '{oldCategory}' to '{updated.category}'");

        if (changes.Count > 0)
        {
            var message = $"✏️ Event '{ev.title}' was updated:\n- {string.Join("\n- ", changes)}";
            await NotifyAttendees(eventId, message);
        }

        return MapToDto(ev);
    }

    public async Task DeleteEventAsync(int id, int organizerId)
    {
        var ev = await _db.Events
            .FirstOrDefaultAsync(e => e.id == id && e.organizerId == organizerId)
            ?? throw new NotFoundException("Event not found or access denied.");

        _db.Events.Remove(ev);
        await _db.SaveChangesAsync();
    }

    public async Task<EventDto?> GetEventByIdAsync(int id)
    {
        var ev = await _db.Events
            .Include(e => e.Organizer)
            .FirstOrDefaultAsync(e => e.id == id);

        if (ev == null)
            return null;

        return MapToDto(ev);
    }

    public async Task<EventWithMaterialsDto?> GetEventWithMaterialsAsync(int id)
    {
        var ev = await _db.Events
            .Include(e => e.Organizer)
            .Include(e => e.Materials)
            .FirstOrDefaultAsync(e => e.id == id);

        if (ev == null)
            return null;

        return new EventWithMaterialsDto
        {
            Event = MapToDto(ev),
            Materials = ev.Materials.Select(m => new MaterialDto
            {
                Id = m.Id,
                FilePath = m.FilePath,
                OriginalName = m.OriginalName,
                FileSize = m.FileSize,
                ContentType = m.ContentType,
                UploadedAt = m.UploadedAt
            }).ToList()
        };
    }

    //only approved endpoints
    public async Task<List<EventDto>> GetApprovedEventsAsync()
    {
        return await _db.Events
            .Include(e => e.Organizer)
            .Where(e => e.status == EventStatus.approved)
            .Select(e => MapToDto(e))
            .ToListAsync();
    }

    //the events that organizer is in charge of
    public async Task<List<EventDto>> getOrganizerEventsAsync(int organizerId)
    {
        return await _db.Events
            .Include(e => e.Organizer)
            .Where(e => e.organizerId == organizerId)
            .OrderByDescending(e => e.createdAt)
            .Select(e => MapToDto(e))
            .ToListAsync();
    }

    //search queries
    public async Task<List<EventDto>> SearchEventsAsync(string? venue, string? category, DateTime? date)
    {
        var query = _db.Events
            .Where(e => e.status == EventStatus.approved)
            .AsQueryable();

        if (!string.IsNullOrEmpty(venue))
            query = query.Where(e => e.venue.Contains(venue));

        if (!string.IsNullOrEmpty(category))
            query = query.Where(e => e.category.Contains(category));

        if (date.HasValue)
            query = query.Where(e => e.eventDate.Date == date.Value.Date);

        return await query
            .Include(e => e.Organizer)
            .Select(e => MapToDto(e))
            .ToListAsync();
    }

    //Uses file helper in helpers
    public async Task<EventDto> UploadEventFilesAsync(int organizerId, int eventId, IFormFile image, IFormFile attachment)
    {
        var ev = await _db.Events
            .FirstOrDefaultAsync(e => e.id == eventId 
            && e.organizerId == organizerId)
            ?? throw new NotFoundException("Event not found or access denied.");

        if (image != null)
            ev.ImagePath = await _fileHelper.SaveFileAsync(image, eventId);

        if (attachment != null)
            ev.AttachmentPath = await _fileHelper.SaveFileAsync(attachment, eventId);

        await _db.SaveChangesAsync();
        return MapToDto(ev);
    }

    // ========== Upload single material ==========
    public async Task<EventMaterial> UploadSingleMaterialAsync(int organizerId, int eventId, IFormFile file)
    {
        var ev = await _db.Events
            .FirstOrDefaultAsync(e => e.id == eventId && e.organizerId == organizerId)
            ?? throw new NotFoundException("Event not found or access denied.");

        var filePath = await _fileHelper.SaveFileAsync(file, eventId);

        var material = new EventMaterial
        {
            EventId = eventId,
            FilePath = filePath,
            OriginalName = file.FileName,
            FileSize = file.Length,
            ContentType = file.ContentType,
            UploadedAt = DateTime.UtcNow
        };

        _db.EventMaterials.Add(material);
        await _db.SaveChangesAsync();

        // Send update notification
        await NotifyAttendees(eventId, $"📎 New material '{file.FileName}' was added to event '{ev.title}'");

        return material;
    }

    // ========== Delete material ==========
    public async Task DeleteMaterialAsync(int organizerId, int eventId, int materialId)
    {
        var material = await _db.EventMaterials
            .Include(m => m.Event)
            .FirstOrDefaultAsync(m => m.Id == materialId && m.EventId == eventId);
        
        if (material == null)
            throw new NotFoundException("Material not found");
        
        if (material.Event.organizerId != organizerId)
            throw new ForbiddenException("You don't have permission to delete this material");
        
        var filePath = Path.Combine(_env.WebRootPath, material.FilePath.TrimStart('/'));
        if (File.Exists(filePath))
            File.Delete(filePath);
        
        _db.EventMaterials.Remove(material);
        await _db.SaveChangesAsync();
    }

    // ========== Helper: Notify all attendees ==========
    //Point is, notify when the event's updated
    private async Task NotifyAttendees(int eventId, string message)
    {
        var attendees = await _db.Tickets
            .Where(t => t.EventId == eventId)
            .Select(t => t.UserId)
            .Distinct()
            .ToListAsync();

        foreach (var userId in attendees)
        {
            await _hub.Clients.Group($"user-{userId}").SendAsync("ReceiveNotification", new
            {
                Id = Guid.NewGuid().ToString(),
                Message = message,
                EventId = eventId,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            });
        }
    }

    //Model to dto mapper
    public static EventDto MapToDto(Events e) => new()
    {
        id = e.id,
        organizerName = e.Organizer?.Name ?? "Unknown",
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
        createdAt = e.createdAt
    };
}