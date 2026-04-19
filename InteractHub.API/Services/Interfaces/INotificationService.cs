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
    Task CreateNotificationAsync(string userId, string message, string type, string? link);
}