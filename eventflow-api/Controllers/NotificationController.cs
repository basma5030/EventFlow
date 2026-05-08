using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/notifications")]
public class NotificationController : ControllerBase
{
    private readonly NotificationService _service;

    public NotificationController(NotificationService service)
    {
        _service = service;
    }

    // Get all notifications for current user
    [HttpGet("my")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = JwtHelper.GetUserId(User);

        var result = await _service.GetMyNotificationsAsync(userId);

        return Ok(result);
    }

    // Get unread notifications
    [HttpGet("unread")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> GetUnread()
    {
        var userId = JwtHelper.GetUserId(User);

        var result = await _service.GetUnreadAsync(userId);

        return Ok(result);
    }

    // Mark one as read
    [HttpPut("read/{id}")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = JwtHelper.GetUserId(User);

        await _service.MarkAsReadAsync(userId, id);

        return Ok(new { message = "Marked as read" });
    }

    // Mark all as read
    [HttpPut("read-all")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = JwtHelper.GetUserId(User);

        await _service.MarkAllAsReadAsync(userId);

        return Ok(new { message = "All notifications marked as read" });
    }
}