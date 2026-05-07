using Eventflow.Data;
using Eventflow.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/notifications")]
public class NotificationController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationController(AppDbContext db)
    {
        _db = db;
    }

    // 📌 Get all notifications for logged-in user
    [HttpGet("my")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = JwtHelper.GetUserId(User);

        var notifications = await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return Ok(notifications);
    }

    // 📌 Get only unread notifications
    [HttpGet("unread")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> GetUnread()
    {
        var userId = JwtHelper.GetUserId(User);

        var notifications = await _db.Notifications
            .Where(n => n.UserId == userId && n.IsRead == false)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return Ok(notifications);
    }

    // 📌 Mark notification as read
    [HttpPut("read/{id}")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = JwtHelper.GetUserId(User);

        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification == null)
            return NotFound(new { message = "Notification not found" });

        notification.IsRead = true;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Marked as read" });
    }

    // 📌 Mark all as read (اختياري بس مفيد)
    [HttpPut("read-all")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = JwtHelper.GetUserId(User);

        var notifications = await _db.Notifications
            .Where(n => n.UserId == userId && n.IsRead == false)
            .ToListAsync();

        foreach (var n in notifications)
        {
            n.IsRead = true;
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = "All notifications marked as read" });
    }
}