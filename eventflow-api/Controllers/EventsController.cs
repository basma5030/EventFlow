using Eventflow.Data;
using Eventflow.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/events")]
public class EventController : ControllerBase
{
    private readonly AppDbContext _db;

    public EventController(AppDbContext db)
    {
        _db = db;
    }

    // CREATE EVENT (Organizer only)
    [HttpPost]
    [Authorize(Roles = "Organizer")]
    public async Task<IActionResult> CreateEvent(Events ev)
    {
        ev.createdAt = DateTime.UtcNow;
        ev.status = Eventflow.Models.Enums.EventStatus.pending;

        _db.Events.Add(ev);
        await _db.SaveChangesAsync();

        return Ok(ev);
    }

    // GET ALL APPROVED EVENTS (for participants)
    [HttpGet]
    public IActionResult GetApprovedEvents()
    {
        var events = _db.Events
            .Where(e => e.status == Eventflow.Models.Enums.EventStatus.approved)
            .ToList();

        return Ok(events);
    }
}