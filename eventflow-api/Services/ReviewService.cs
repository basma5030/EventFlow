using Eventflow.Data;
using Eventflow.DTOs;
using Eventflow.Exceptions;
using Eventflow.Models;
using Microsoft.EntityFrameworkCore;

//we use generic repo for simple CRUD, but use dbcontext for complex queries
public class ReviewService
{
  private readonly IRepository<Review, int> _revRepo;
  private readonly AppDbContext _db; // only for complex queries
  private readonly IRepository<Events, int> _eventRepo;

    public ReviewService(IRepository<Review, int> repo, 
    IRepository<Events, int> eventRepo,
     AppDbContext db)
    {
        _revRepo = repo;
        _db = db;
        _eventRepo = eventRepo;
    }


    public async Task<ReviewDto> AddReviewAsync(
        int eventId,
        int userId,
        ReviewDto dto)
    {
       var ev = await _eventRepo.GetByIdAsync(eventId); //uses generic 

        if (ev == null)
            throw new NotFoundException("Event not found");

        var exists = await _db.Reviews
            .AnyAsync(r => r.UserId == userId && r.EventId == eventId);

        if (exists)
            throw new ValidationException("You already reviewed this event");

        var review = new Review
        {
            UserId = userId,
            EventId = eventId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };
        
        // uses repo
        await _revRepo.AddAsync(review); 
        await _revRepo.SaveChangesAsync();
        return MapReviewToDto(review);
    }

    public async Task<List<ReviewDto>> GetEventReviewsAsync(int eventId)
    {
        //complex query, cannot implement generic obv.
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