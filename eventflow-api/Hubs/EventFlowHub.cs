using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

[Authorize]
public class EventFlowHub : Hub
{
    // ========== Notifications ==========
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;

        if (userId != null)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"user-{userId}");
            
            Console.WriteLine($"✅ User {userId} connected and added to group user-{userId}");
        }

        await base.OnConnectedAsync();
    }

    // ========== Join user group (called from frontend) ==========
    public async Task JoinUserGroup(int userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
        Console.WriteLine($"✅ User {userId} manually joined group user-{userId}");
    }

    // ========== Event-specific groups ==========
    public async Task JoinEventGroup(int eventId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"event-{eventId}");
        Console.WriteLine($"Connection {Context.ConnectionId} joined event-{eventId} group");
    }

    public async Task LeaveEventGroup(int eventId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"event-{eventId}");
        Console.WriteLine($"Connection {Context.ConnectionId} left event-{eventId} group");
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        
        if (userId != null)
        {
            Console.WriteLine($"User {userId} disconnected. Reason: {exception?.Message ?? "Normal disconnect"}");
        }
        
        await base.OnDisconnectedAsync(exception);
    }
}