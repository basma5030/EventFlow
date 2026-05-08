using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

[Authorize]
public class EventFlowHub : Hub
{
    // Client joins on login, leaves on logout
    //==========Notifications=========
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;

        if (userId != null)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"user-{userId}");
        }

        await base.OnConnectedAsync();
    }

    //the below methods are for event-specific groups (e.g. for live updates on ticket sales)
    // Client joins when opening an event detail page
    // Client leaves when navigating away
    //=========tickets========

    public async Task JoinEventGroup(int eventId)
    {
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            $"event-{eventId}");
    }

    public async Task LeaveEventGroup(int eventId)
    {
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            $"event-{eventId}");
    }

    //cleanup on disconnect because user might have multiple connections (e.g. multiple tabs)
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}