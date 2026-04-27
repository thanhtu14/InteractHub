// Controllers/MessagesController.cs
using System.Security.Claims;
using InteractHub.API.Common.Extensions;
using InteractHub.API.DTOs.Messages;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/messages")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messageService;
    public MessagesController(IMessageService messageService) => _messageService = messageService;

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpPost("conversation")]
    public async Task<IActionResult> GetOrCreateConversation([FromBody] CreateConversationDto dto)
    {
        var result = await _messageService.GetOrCreateConversationAsync(GetUserId(), dto.TargetUserId);
        return result.ToActionResult(this);
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var result = await _messageService.GetConversationsAsync(GetUserId());
        return result.ToActionResult(this);
    }

    [HttpGet("{conversationId}")]
    public async Task<IActionResult> GetMessages(
        long conversationId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _messageService.GetMessagesAsync(GetUserId(), conversationId, page, pageSize);
        return result.ToActionResult(this);
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromForm] SendMessageDto dto)
    {
        var result = await _messageService.SendMessageAsync(GetUserId(), dto);
        return result.ToActionResult(this);
    }

    [HttpPut("{conversationId}/read")]
    public async Task<IActionResult> MarkAsRead(long conversationId)
    {
        var result = await _messageService.MarkAsReadAsync(GetUserId(), conversationId);
        return result.ToActionResult(this);
    }

    [HttpDelete("{messageId}")]
    public async Task<IActionResult> DeleteMessage(long messageId)
    {
        var result = await _messageService.DeleteMessageAsync(GetUserId(), messageId);
        return result.ToActionResult(this);
    }
}