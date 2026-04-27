// DTOs/Messages/MessageDto.cs
namespace InteractHub.API.DTOs.Messages;

public class SendMessageDto
{
    public long ConversationId { get; set; }
    public string? Content { get; set; }
    public IFormFile? MediaFile { get; set; }
}

public class CreateConversationDto
{
    public string TargetUserId { get; set; } = string.Empty;
}

public class MessageResponseDto
{
    public long Id { get; set; }
    public long ConversationId { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string? SenderAvatar { get; set; }
    public string? Content { get; set; }
    public int MessageType { get; set; }
    public bool IsRead { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<MessageMediaDto> Medias { get; set; } = new();
}

public class MessageMediaDto
{
    public int MediaType { get; set; }
    public string MediaUrl { get; set; } = string.Empty;
    public string? FileName { get; set; }
    public long? FileSize { get; set; }
}

public class ConversationResponseDto
{
    public long Id { get; set; }
    public string OtherUserId { get; set; } = string.Empty;
    public string OtherUserName { get; set; } = string.Empty;
    public string? OtherUserAvatar { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
}