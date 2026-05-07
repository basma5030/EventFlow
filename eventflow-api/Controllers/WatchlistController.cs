using Eventflow.Data;
using Eventflow.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/watchlist")]
public class WatchlistController : ControllerBase
{
    private readonly AppDbContext _db;

    public WatchlistController(AppDbContext db)
    {
        _db = db;
    }

    // ⭐ Add event to watchlist
    [HttpPost("{eventId}")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> AddToWatchlist(int eventId)
    {
        var userId = JwtHelper.GetUserId(User);

        var ev = await _db.Events.FindAsync(eventId);
        if (ev == null)
            return NotFound("Event not found");

        var exists = await _db.Watchlist
            .AnyAsync(w => w.UserId == userId && w.EventId == eventId);

        if (exists)
            return BadRequest("Already in watchlist");

        var item = new Watchlist
        {
            UserId = userId,
            EventId = eventId,
            savedAt = DateTime.UtcNow
        };

        _db.Watchlist.Add(item);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Added to watchlist" });
    }

    // ⭐ Remove from watchlist
    [HttpDelete("{eventId}")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> RemoveFromWatchlist(int eventId)
    {
        var userId = JwtHelper.GetUserId(User);

        var item = await _db.Watchlist
            .FirstOrDefaultAsync(w => w.UserId == userId && w.EventId == eventId);

        if (item == null)
            return NotFound("Not in watchlist");

        _db.Watchlist.Remove(item);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Removed from watchlist" });
    }

    // ⭐ FIXED: Get my watchlist
    [HttpGet("my")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> GetMyWatchlist()
    {
        var userId = JwtHelper.GetUserId(User);

        var list = await _db.Watchlist
            .Include(w => w.Event)   // ✅ الصح هنا
            .Where(w => w.UserId == userId)
            .ToListAsync();

        return Ok(list);
    }
}