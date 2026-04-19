using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Notification;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;

namespace InteractHub.API.Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepo;

    public NotificationService(INotificationRepository notificationRepo)
    {
        _notificationRepo = notificationRepo;
    }

    public async Task<Result<IEnumerable<NotificationResponseDto>>> GetNotificationsByUserIdAsync(string userId)
    {
        var notifications = await _notificationRepo.GetByUserIdAsync(userId);
        return Result<IEnumerable<NotificationResponseDto>>.Ok(
            notifications.Select(n => new NotificationResponseDto
            {
                Id = n.Id,
                Message = n.Message,
                Type = n.Type,
                Link = n.Link,
                IsRead = n.IsRead ?? false,
                CreatedAt = n.CreatedAt
            })
        );
    }

    public async Task<Result<int>> GetUnreadCountAsync(string userId)
    {
        var count = await _notificationRepo.CountUnreadAsync(userId);
        return Result<int>.Ok(count);
    }

    public async Task<Result<string>> MarkAsReadAsync(int notificationId, string userId)
    {
        var notification = await _notificationRepo.GetByIdAsync(notificationId, userId);
        if (notification == null)
            return Result<string>.NotFound("Không tìm thấy thông báo hoặc bạn không có quyền.");

        notification.IsRead = true;
        _notificationRepo.Update(notification);
        await _notificationRepo.SaveChangesAsync();
        return Result<string>.Ok(message: "Đã đánh dấu thông báo là đã đọc.");
    }

    public async Task<Result<string>> MarkAllAsReadAsync(string userId)
    {
        var notifications = await _notificationRepo.GetByUserIdAsync(userId);
        var unreadOnes = notifications.Where(n => n.IsRead == false || n.IsRead == null).ToList();

        foreach (var n in unreadOnes)
        {
            n.IsRead = true;
            _notificationRepo.Update(n);
        }

        await _notificationRepo.SaveChangesAsync();
        return Result<string>.Ok(message: "Đã đánh dấu tất cả thông báo là đã đọc.");
    }

    public async Task<Result<string>> DeleteNotificationAsync(int notificationId, string userId)
    {
        var notification = await _notificationRepo.GetByIdAsync(notificationId, userId);
        if (notification == null)
            return Result<string>.NotFound("Không thể xóa thông báo.");

        _notificationRepo.Delete(notification);
        await _notificationRepo.SaveChangesAsync();
        return Result<string>.Ok(message: "Đã xóa thông báo thành công.");
    }

    // Không đổi vì được gọi nội bộ từ các Service khác
    public async Task CreateNotificationAsync(string userId, string message, string type, string? link)
    {
        var notification = new Notification
        {
            UserId = userId,
            Message = message,
            Type = type,
            Link = link,
            IsRead = false,
            CreatedAt = DateTime.Now
        };

        await _notificationRepo.AddAsync(notification);
        await _notificationRepo.SaveChangesAsync();
    }
}