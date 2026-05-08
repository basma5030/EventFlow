using Eventflow.Data;
using Eventflow.DTOs;
using Eventflow.Models;
using Microsoft.EntityFrameworkCore;

public class ReviewService
{
    private readonly AppDbContext _db;

    public ReviewService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ReviewDto> AddReviewAsync(
        int eventId,
        int userId,
        ReviewDto dto)
    {
        var ev = await _db.Events.FindAsync(eventId);

        if (ev == null)
            throw new Exception("Event not found");

        var exists = await _db.Reviews
            .AnyAsync(r => r.UserId == userId && r.EventId == eventId);

        if (exists)
            throw new Exception("You already reviewed this event");

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

        return MapReviewToDto(review);
    }

    public async Task<List<ReviewDto>> GetEventReviewsAsync(int eventId)
    {
        return await _db.Reviews
            .Where(r => r.EventId == eventId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => MapReviewToDto(r))
            .ToListAsync();
    }

    public async Task<List<ReviewDto>> GetMyReviewsAsync(int userId)
    {
        return await _db.Reviews
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => MapReviewToDto(r))
            .ToListAsync();
    }

    private static ReviewDto MapReviewToDto(Review review)
    {
        return new ReviewDto
        {
            Id = review.Id,
            EventId = review.EventId,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }
}