using Eventflow.Data;
using Eventflow.Models;
using Eventflow.Exceptions;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

public class NotificationService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<EventFlowHub> _hub;

    public NotificationService(AppDbContext db, IHubContext<EventFlowHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    public async Task<List<Notification>> GetMyNotificationsAsync(int userId)
    {
        return await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Notification>> GetUnreadAsync(int userId)
    {
        return await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task MarkAsReadAsync(int id, int userId)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id 
            && n.UserId == userId) 
             ?? throw new NotFoundException("Notification not found.");


        notification.IsRead = true;
        await _db.SaveChangesAsync();

        // notify frontend instantly
        await _hub.Clients
        .Group($"user-{userId}")
        .SendAsync("NotificationRead", new
        {
            notification.Id
        });
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var notifications = await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in notifications)
        {
            n.IsRead = true;
        }

        await _db.SaveChangesAsync();
         await _hub.Clients
        .Group($"user-{userId}")
        .SendAsync("AllNotificationsRead");
    }

    public async Task SendNotificationAsync(int userId,
     int eventId, string message)
{
    var notification = new Notification
    {
        UserId = userId,
        EventId = eventId,
        Message = message,
        CreatedAt = DateTime.UtcNow,
        IsRead = false
    };

    _db.Notifications.Add(notification);
    await _db.SaveChangesAsync();

    //send only to intended recipent.
    await _hub.Clients
        .Group($"user-{userId}")
        .SendAsync("ReceiveNotification", new
        {
            notification.Id,
            notification.Message,
            notification.CreatedAt,
            notification.EventId
        });
}
}