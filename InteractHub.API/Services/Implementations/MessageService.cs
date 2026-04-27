using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Messages;
using InteractHub.API.Entities;
using InteractHub.API.Hubs;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services.Implementations;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _messageRepo;
    private readonly IMediaService _mediaService;
    private readonly IHubContext<ChatHub> _hubContext;

    public MessageService(
        IMessageRepository messageRepo,
        IMediaService mediaService,
        IHubContext<ChatHub> hubContext)
    {
        _messageRepo = messageRepo;
        _mediaService = mediaService;
        _hubContext = hubContext;
    }

    // ── Lấy hoặc tạo conversation giữa 2 người ──────────────────
    public async Task<Result<ConversationResponseDto>> GetOrCreateConversationAsync(
        string currentUserId, string targetUserId)
    {
        if (currentUserId == targetUserId)
            return Result<ConversationResponseDto>.BadRequest("Không thể tạo hội thoại với chính mình.");

        var conversation = await _messageRepo.GetConversationBetweenUsersAsync(
            currentUserId, targetUserId);

        if (conversation == null)
        {
            conversation = await _messageRepo.CreateConversationAsync(new Conversation
            {
                User1Id = currentUserId,
                User2Id = targetUserId,
                CreatedAt = DateTime.UtcNow,
            });
        }

        return Result<ConversationResponseDto>.Ok(
            MapToConversationDto(conversation, currentUserId, 0, null));
    }

    // ── Lấy danh sách conversation của user ─────────────────────
    public async Task<Result<IEnumerable<ConversationResponseDto>>> GetConversationsAsync(
        string currentUserId)
    {
        var conversations = await _messageRepo.GetConversationsByUserIdAsync(currentUserId);

        var result = new List<ConversationResponseDto>();

        foreach (var conv in conversations)
        {
            var unreadCount = await _messageRepo.CountUnreadMessagesAsync(
                conv.Id, currentUserId);

            var lastMessage = conv.Messages.FirstOrDefault();
            result.Add(MapToConversationDto(conv, currentUserId, unreadCount, lastMessage));
        }

        return Result<IEnumerable<ConversationResponseDto>>.Ok(result);
    }

    // ── Lấy tin nhắn theo trang ──────────────────────────────────
    public async Task<Result<IEnumerable<MessageResponseDto>>> GetMessagesAsync(
        string currentUserId, long conversationId, int page, int pageSize)
    {
        var conversation = await _messageRepo.GetConversationByIdAsync(conversationId);

        if (conversation == null ||
            (conversation.User1Id != currentUserId && conversation.User2Id != currentUserId))
            return Result<IEnumerable<MessageResponseDto>>.NotFound("Hội thoại không tồn tại.");

        var messages = await _messageRepo.GetMessagesByConversationIdAsync(
            conversationId, page, pageSize);

        return Result<IEnumerable<MessageResponseDto>>.Ok(messages.Select(MapToMessageDto));
    }

    // ── Gửi tin nhắn ────────────────────────────────────────────
    public async Task<Result<MessageResponseDto>> SendMessageAsync(
        string currentUserId, SendMessageDto dto)
    {
        var conversation = await _messageRepo.GetConversationByIdAsync(dto.ConversationId);

        if (conversation == null ||
            (conversation.User1Id != currentUserId && conversation.User2Id != currentUserId))
            return Result<MessageResponseDto>.NotFound("Hội thoại không tồn tại.");

        if (string.IsNullOrWhiteSpace(dto.Content) && dto.MediaFile == null)
            return Result<MessageResponseDto>.BadRequest("Tin nhắn không được để trống.");

        var message = new Message
        {
            ConversationId = dto.ConversationId,
            SenderId = currentUserId,
            Content = dto.Content,
            MessageType = dto.MediaFile != null
                ? GetMediaMessageType(dto.MediaFile.ContentType)
                : MessageType.Text,
            CreatedAt = DateTime.UtcNow,
            Medias = new List<MessageMedia>()
        };

        // Upload media nếu có
        if (dto.MediaFile != null)
        {
            var url = await _mediaService.SaveFileAsync(dto.MediaFile, "messages");
            if (!string.IsNullOrEmpty(url))
            {
                message.Medias.Add(new MessageMedia
                {
                    MediaType = (int)GetMediaMessageType(dto.MediaFile.ContentType),
                    MediaUrl = url,
                    FileName = dto.MediaFile.FileName,
                    FileSize = dto.MediaFile.Length,
                });
            }
        }

        await _messageRepo.CreateMessageAsync(message);

        // Cập nhật LastMessageAt của conversation
        conversation.LastMessageAt = DateTime.UtcNow;
        await _messageRepo.SaveChangesAsync();

        // Load sender để map
        var responseDto = MapToMessageDto(message);

        // ── Notify realtime qua SignalR ──────────────────────────
        var receiverId = conversation.User1Id == currentUserId
            ? conversation.User2Id
            : conversation.User1Id;

        await _hubContext.Clients
            .Group(receiverId)
            .SendAsync("ReceiveMessage", responseDto);

        return Result<MessageResponseDto>.Ok(responseDto, "Gửi tin nhắn thành công.");
    }

    // ── Đánh dấu đã đọc toàn bộ tin nhắn trong conversation ────
    public async Task<Result<string>> MarkAsReadAsync(string currentUserId, long conversationId)
    {
        var unreadMessages = await _messageRepo.GetUnreadMessagesAsync(
            conversationId, currentUserId);

        var messageList = unreadMessages.ToList();

        if (!messageList.Any())
            return Result<string>.Ok(message: "Không có tin nhắn chưa đọc.");

        messageList.ForEach(m => m.IsRead = true);
        await _messageRepo.SaveChangesAsync();

        // Notify người gửi biết tin nhắn đã được đọc
        var senderId = messageList.First().SenderId;
        await _hubContext.Clients
            .Group(senderId)
            .SendAsync("MessagesRead", new { conversationId, readBy = currentUserId });

        return Result<string>.Ok(message: "Đã đánh dấu đã đọc.");
    }

    // ── Xóa tin nhắn (soft delete) ───────────────────────────────
    public async Task<Result<string>> DeleteMessageAsync(string currentUserId, long messageId)
    {
        var message = await _messageRepo.GetMessageByIdAsync(messageId);

        if (message == null)
            return Result<string>.NotFound("Tin nhắn không tồn tại.");

        if (message.SenderId != currentUserId)
            return Result<string>.BadRequest("Bạn không có quyền xóa tin nhắn này.");

        message.IsDeleted = true;
        await _messageRepo.SaveChangesAsync();

        // Notify realtime
        var conversation = await _messageRepo.GetConversationByIdAsync(message.ConversationId);

var receiverId = conversation.User1Id == currentUserId
    ? conversation.User2Id
    : conversation.User1Id;

await _hubContext.Clients
    .Group(receiverId)
    .SendAsync("MessageDeleted", messageId);

        return Result<string>.Ok(message: "Đã xóa tin nhắn.");
    }

    // ── Helpers ──────────────────────────────────────────────────
    private static MessageType GetMediaMessageType(string contentType) => contentType switch
    {
        var t when t.StartsWith("image") => MessageType.Image,
        var t when t.StartsWith("video") => MessageType.Video,
        var t when t.StartsWith("audio") => MessageType.Audio,
        _ => MessageType.File
    };

    private static MessageResponseDto MapToMessageDto(Message m) => new()
    {
        Id = m.Id,
        ConversationId = m.ConversationId,
        SenderId = m.SenderId,
        SenderName = m.Sender?.FullName ?? m.Sender?.UserName ?? "User",
        SenderAvatar = m.Sender?.ProfilePicture,
        Content = m.Content,
        MessageType = (int)m.MessageType,
        IsRead = m.IsRead,
        IsDeleted = m.IsDeleted,
        CreatedAt = m.CreatedAt,
        Medias = m.Medias?.Select(media => new MessageMediaDto
        {
            MediaType = media.MediaType,
            MediaUrl = media.MediaUrl,
            FileName = media.FileName,
            FileSize = media.FileSize,
        }).ToList() ?? new()
    };

    private static ConversationResponseDto MapToConversationDto(
        Conversation c, string currentUserId, int unreadCount, Message? lastMessage)
    {
        var otherUser = c.User1Id == currentUserId ? c.User2 : c.User1;
        return new ConversationResponseDto
        {
            Id = c.Id,
            OtherUserId = otherUser?.Id ?? "",
            OtherUserName = otherUser?.FullName ?? otherUser?.UserName ?? "User",
            OtherUserAvatar = otherUser?.ProfilePicture,
            LastMessage = lastMessage?.IsDeleted == true
                ? "Tin nhắn đã bị xóa"
                : lastMessage?.Content,
            LastMessageAt = c.LastMessageAt,
            UnreadCount = unreadCount,
        };
    }
}