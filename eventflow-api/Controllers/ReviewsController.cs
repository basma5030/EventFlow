using Eventflow.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly ReviewService _service;

    public ReviewsController(ReviewService service)
    {
        _service = service;
    }

    [HttpPost("{eventId}")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> AddReview(
        int eventId,
        [FromBody] ReviewDto dto)
    {
        var userId = JwtHelper.GetUserId(User);

        var result = await _service.AddReviewAsync(
            eventId,
            userId,
            dto);

        return Ok(result);
    }

    [HttpGet("event/{eventId}")]
    public async Task<IActionResult> GetEventReviews(int eventId)
    {
        var result = await _service.GetEventReviewsAsync(eventId);

        return Ok(result);
    }

    [HttpGet("my")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> GetMyReviews()
    {
        var userId = JwtHelper.GetUserId(User);

        var result = await _service.GetMyReviewsAsync(userId);

        return Ok(result);
    }
}