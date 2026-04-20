// using InteractHub.API.Common.Responses;
// using InteractHub.API.DTOs.Notification;

// namespace InteractHub.API.Services.Interfaces;

// public interface INotificationService
// {
//     Task<Result<IEnumerable<NotificationResponseDto>>> GetNotificationsByUserIdAsync(string userId);
//     Task<Result<int>> GetUnreadCountAsync(string userId);
//     Task<Result<string>> MarkAsReadAsync(int notificationId, string userId);
//     Task<Result<string>> MarkAllAsReadAsync(string userId);
//     Task<Result<string>> DeleteNotificationAsync(int notificationId, string userId);
//     Task CreateNotificationAsync(string userId, string message, string type, string? link);
    
// }
using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Notification;

namespace InteractHub.API.Services.Interfaces;

public interface INotificationService
{
    Task<Result<IEnumerable<NotificationResponseDto>>> GetNotificationsByUserIdAsync(string userId);
    Task<Result<int>> GetUnreadCountAsync(string userId);
    Task<Result<string>> MarkAsReadAsync(int notificationId, string userId);
    Task<Result<string>> MarkAllAsReadAsync(string userId);
    Task<Result<string>> DeleteNotificationAsync(int notificationId, string userId);

    // Hàm quan trọng để xử lý Like/Comment gom nhóm
    Task CreateOrUpdateInteractionNotificationAsync(string receiverId, string actorId, string type, string link, string message, int currentCount);
    
    // Hàm tạo thông báo đơn lẻ (ví dụ: Follow, Friend Request)
    Task CreateNotificationAsync(string userId, string message, string type, string? link);
    Task DeleteNotificationByLogicAsync(string receiverId, string type, string link);
}