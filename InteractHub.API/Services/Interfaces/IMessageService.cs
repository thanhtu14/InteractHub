// Services/Interfaces/IMessageService.cs
using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Messages;

namespace InteractHub.API.Services.Interfaces;

public interface IMessageService
{
    Task<Result<ConversationResponseDto>> GetOrCreateConversationAsync(string currentUserId, string targetUserId);
    Task<Result<IEnumerable<ConversationResponseDto>>> GetConversationsAsync(string currentUserId);
    Task<Result<IEnumerable<MessageResponseDto>>> GetMessagesAsync(string currentUserId, long conversationId, int page, int pageSize);
    Task<Result<MessageResponseDto>> SendMessageAsync(string currentUserId, SendMessageDto dto);
    Task<Result<string>> MarkAsReadAsync(string currentUserId, long conversationId);
    Task<Result<string>> DeleteMessageAsync(string currentUserId, long messageId);
}