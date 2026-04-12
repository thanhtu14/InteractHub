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

    // 1. Lấy danh sách thông báo của User (đã map sang DTO)
    public async Task<IEnumerable<NotificationResponseDto>> GetNotificationsByUserIdAsync(string userId)
    {
        var notifications = await _notificationRepo.GetByUserIdAsync(userId);
        
        return notifications.Select(n => new NotificationResponseDto
        {
            Id = n.Id,
            Message = n.Message,
            Type = n.Type,
            Link = n.Link,
            IsRead = n.IsRead ?? false,
            CreatedAt = n.CreatedAt
        });
    }

    // 2. Đếm số thông báo chưa đọc
    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return await _notificationRepo.CountUnreadAsync(userId);
    }

    // 3. Đánh dấu một thông báo là đã đọc
    public async Task<bool> MarkAsReadAsync(int notificationId, string userId)
    {
        var notification = await _notificationRepo.GetByIdAsync(notificationId, userId);
        if (notification == null) return false;

        notification.IsRead = true;
        _notificationRepo.Update(notification);
        return await _notificationRepo.SaveChangesAsync();
    }

    // 4. Đánh dấu tất cả là đã đọc
    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        var notifications = await _notificationRepo.GetByUserIdAsync(userId);
        var unreadOnes = notifications.Where(n => n.IsRead == false || n.IsRead == null);

        if (!unreadOnes.Any()) return true;

        foreach (var n in unreadOnes)
        {
            n.IsRead = true;
            _notificationRepo.Update(n);
        }

        return await _notificationRepo.SaveChangesAsync();
    }

    // 5. Xóa thông báo
    public async Task<bool> DeleteNotificationAsync(int notificationId, string userId)
    {
        var notification = await _notificationRepo.GetByIdAsync(notificationId, userId);
        if (notification == null) return false;

        _notificationRepo.Delete(notification);
        return await _notificationRepo.SaveChangesAsync();
    }

    // 6. Tạo thông báo mới (Hàm này sẽ được các Service khác gọi)
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