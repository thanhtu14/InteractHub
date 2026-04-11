namespace InteractHub.API.DTOs.Notification;

public class NotificationResponseDto
{
    public int Id { get; set; }
    public string? Message { get; set; }
    public string? Type { get; set; }
    public string? Link { get; set; }
    public bool IsRead { get; set; }
    public DateTime? CreatedAt { get; set; }
}