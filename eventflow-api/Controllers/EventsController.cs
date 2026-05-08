using Eventflow.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/events")]
public class EventController : ControllerBase
{
    private readonly EventService _service;

    public EventController(EventService service)
    {
        _service = service;
    }

    [HttpPost]
    [Authorize(Roles = "Organizer")]
    public async Task<IActionResult> CreateEvent(CreateEventDto dto)
    {
        var uid = JwtHelper.GetUserId(User);

        var result = await _service.CreateEventAsync(uid, dto);

        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Organizer")]
    public async Task<IActionResult> UpdateEvent(int id, CreateEventDto dto)
    {
        var userId = JwtHelper.GetUserId(User);

        var result = await _service.UpdateEventAsync(id, userId, dto);

        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Organizer")]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        var userId = JwtHelper.GetUserId(User);

        await _service.DeleteEventAsync(id, userId);

        return Ok(new { message = "Deleted" });
    }

    [HttpGet]
    public async Task<IActionResult> GetApprovedEvents()
    {
        var data = await _service.GetApprovedEventsAsync();

        return Ok(data);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchEvents(
        [FromQuery] string? venue,
        [FromQuery] string? category,
        [FromQuery] DateTime? date)
    {
        var data = await _service.SearchEventsAsync(
            venue,
            category,
            date);

        return Ok(data);
    }
     [HttpGet("my")]
    [Authorize(Roles = "Organizer")]
    public async Task<IActionResult> MyEvents()
    {
        var uid    = JwtHelper.GetUserId(User);
        var events = await _service.getOrganizerEventsAsync(uid);
        return Ok(events);
    }
}