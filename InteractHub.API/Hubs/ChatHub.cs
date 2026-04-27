// Hubs/ChatHub.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace InteractHub.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    // Khi user kết nối → join vào group theo userId để nhận tin nhắn
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }
        await base.OnConnectedAsync();
    }

    // Khi user ngắt kết nối → rời group
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
        }
        await base.OnDisconnectedAsync(exception);
    }

    // Client gọi để báo "đang gõ..."
    public async Task TypingIndicator(string conversationId, string receiverId)
    {
        var senderId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        await Clients.Group(receiverId).SendAsync("UserTyping", new { conversationId, senderId });
    }
}