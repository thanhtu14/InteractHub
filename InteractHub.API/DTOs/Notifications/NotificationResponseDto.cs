// namespace InteractHub.API.DTOs.Notification;

// public class NotificationResponseDto
// {
//     public int Id { get; set; }
//     public string? Message { get; set; }
//     public string? Type { get; set; }
//     public string? Link { get; set; }
//     public bool IsRead { get; set; }
//     public DateTime? CreatedAt { get; set; }
// }
namespace InteractHub.API.DTOs.Notification;
public class NotificationResponseDto
{
    public int Id { get; set; }
    public string? Message { get; set; }
    public string? Type { get; set; }
    public string? Link { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // --- Bổ sung các trường này ---
    public string? LastActorName { get; set; }
    public string? LastActorAvatar { get; set; }
    public int ActorsCount { get; set; }
}