using InteractHub.API.DTOs.Notification; // Giả sử bạn đặt DTO ở đây

public interface INotificationService
{
    // Đổi từ Notification sang NotificationResponseDto
    Task<IEnumerable<NotificationResponseDto>> GetNotificationsByUserIdAsync(string userId);
    Task<int> GetUnreadCountAsync(string userId);
    Task<bool> MarkAsReadAsync(int notificationId, string userId);
    Task<bool> MarkAllAsReadAsync(string userId);
    Task<bool> DeleteNotificationAsync(int notificationId, string userId);
    Task CreateNotificationAsync(string userId, string message, string type, string? link);
}