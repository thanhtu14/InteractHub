using InteractHub.API.Data;
using InteractHub.API.Entities;
using InteractHub.API.DTOs.Notification; // Đảm bảo using đúng namespace của DTO
using InteractHub.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }

    // --- SỬA LỖI TẠI ĐÂY: Trả về Task<IEnumerable<NotificationResponseDto>> ---
    public async Task<IEnumerable<NotificationResponseDto>> GetNotificationsByUserIdAsync(string userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationResponseDto
            {
                Id = n.Id,
                Message = n.Message,
                Type = n.Type,
                Link = n.Link,
                IsRead = n.IsRead.GetValueOrDefault(), // Ép từ bool? sang bool
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && n.IsRead.GetValueOrDefault() == false);
    }

    public async Task<bool> MarkAsReadAsync(int notificationId, string userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        var unreadNotifications = await _context.Notifications
            .Where(n => n.UserId == userId && n.IsRead.GetValueOrDefault() == false)
            .ToListAsync();

        if (!unreadNotifications.Any()) return true;

        foreach (var n in unreadNotifications)
        {
            n.IsRead = true;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteNotificationAsync(int notificationId, string userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return true;
    }

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

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
    }
}