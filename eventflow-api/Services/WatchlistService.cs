using Eventflow.Data;
using Microsoft.EntityFrameworkCore;
using Eventflow.Models;
using Eventflow.Models.Enums;
using Eventflow.DTOs;
using Eventflow.Exceptions;

public class WatchlistService
{
    private readonly AppDbContext _db;

    public WatchlistService(AppDbContext db) { _db = db; }

    public async Task<List<EventDto>> getWatchListAsync(int userId)
    {
        return await _db.Watchlist
        .Include(w => w.Event)
        .ThenInclude(e => e.Organizer)
        .Where(w => w.UserId == userId 
        && w.Event.status == EventStatus.approved)
        .OrderByDescending(w => w.savedAt)
        .Select(w => EventService.MapToDto(w.Event))
        .ToListAsync();
    }
    public async Task addToWatchlistAsync(int userId, int eventId)
    {
       var eventExists = await _db.Events.AnyAsync(e => e.id == eventId
         && e.status == EventStatus.approved);
        if(!eventExists)
        {
            throw new NotFoundException("Event not found or not approved yet.");
        }
        var alreadySaved = await _db.Watchlist.AnyAsync(w => w.UserId == userId
         && w.EventId == eventId);
        if(alreadySaved)
        {
            throw new ValidationException("Event is already in the watchlist.");
        }
        _db.Watchlist.Add(new Watchlist
        {
            UserId = userId,
            EventId = eventId,
            savedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }
    public async Task removeFromWatchlistAsync(int userId, int eventId)
    {
        var entry = await _db.Watchlist.FirstOrDefaultAsync(w => w.UserId == userId
         && w.EventId == eventId) ??
         throw new NotFoundException("Event not found in watchlist.");
        _db.Watchlist.Remove(entry);
        await _db.SaveChangesAsync();
    }  
    public async Task<bool> IsWatchlistedAsync(int userId, int eventId)
    {
        return await _db.Watchlist
            .AnyAsync(w => w.UserId  == userId
                        && w.EventId == eventId);
    }

}