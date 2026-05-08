using Eventflow.Data;
using Eventflow.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Controllers/WatchlistController.cs
[ApiController]
[Route("api/watchlist")]
[Authorize(Roles = "Participant")]
public class WatchlistController : ControllerBase
{
    private readonly WatchlistService _watchlist;
    public WatchlistController(WatchlistService watchlist)
    {
        _watchlist = watchlist;
    }

    [HttpGet]
    public async Task<IActionResult> GetMy()
    {
        var uid    = JwtHelper.GetUserId(User);
        var events = await _watchlist.getWatchListAsync(uid);
        return Ok(events);
    }

    [HttpPost("{eventId}")]
    public async Task<IActionResult> Add(int eventId)
    {
        var uid = JwtHelper.GetUserId(User);
        await _watchlist.addToWatchlistAsync(uid, eventId);
        return Ok(new { message = "Event saved to watchlist." });
    }

    [HttpDelete("{eventId}")]
    public async Task<IActionResult> Remove(int eventId)
    {
        var uid = JwtHelper.GetUserId(User);
        await _watchlist.removeFromWatchlistAsync(uid, eventId);
        return Ok(new { message = "Removed from watchlist." });
    }

    [HttpGet("{eventId}/status")]
    public async Task<IActionResult> Status(int eventId)
    {
        var uid   = JwtHelper.GetUserId(User);
        var saved = await _watchlist.IsWatchlistedAsync(uid, eventId);
        return Ok(new { saved });
    }
}