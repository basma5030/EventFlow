using Eventflow.Data;
using Eventflow.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReviewsController(AppDbContext db)
    {
        _db = db;
    }

    // ⭐ Add review
    [HttpPost("{eventId}")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> AddReview(int eventId, [FromBody] Review dto)
    {
        var userId = JwtHelper.GetUserId(User);

        // optional: check if event exists
        var ev = await _db.Events.FindAsync(eventId);
        if (ev == null)
            return NotFound("Event not found");

        var review = new Review
        {
            UserId = userId,
            EventId = eventId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Review added" });
    }

    // ⭐ Get reviews for specific event
    [HttpGet("event/{eventId}")]
    public async Task<IActionResult> GetEventReviews(int eventId)
    {
        var reviews = await _db.Reviews
            .Where(r => r.EventId == eventId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews);
    }

    // ⭐ Get my reviews
    [HttpGet("my")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> GetMyReviews()
    {
        var userId = JwtHelper.GetUserId(User);

        var reviews = await _db.Reviews
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews);
    }
}