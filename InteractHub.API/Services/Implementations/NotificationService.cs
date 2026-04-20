// using InteractHub.API.Common.Responses;
// using InteractHub.API.DTOs.Notification;
// using InteractHub.API.Entities;
// using InteractHub.API.Repositories.Interfaces;
// using InteractHub.API.Services.Interfaces;

// namespace InteractHub.API.Services.Implementations;

// public class NotificationService : INotificationService
// {
//     private readonly INotificationRepository _notificationRepo;

//     public NotificationService(INotificationRepository notificationRepo)
//     {
//         _notificationRepo = notificationRepo;
//     }

//     public async Task<Result<IEnumerable<NotificationResponseDto>>> GetNotificationsByUserIdAsync(string userId)
//     {
//         var notifications = await _notificationRepo.GetByUserIdAsync(userId);
//         return Result<IEnumerable<NotificationResponseDto>>.Ok(
//             notifications.Select(n => new NotificationResponseDto
//             {
//                 Id = n.Id,
//                 Message = n.Message,
//                 Type = n.Type,
//                 Link = n.Link,
//                 IsRead = n.IsRead ?? false,
//                 CreatedAt = n.CreatedAt
//             })
//         );
//     }

//     public async Task<Result<int>> GetUnreadCountAsync(string userId)
//     {
//         var count = await _notificationRepo.CountUnreadAsync(userId);
//         return Result<int>.Ok(count);
//     }

//     public async Task<Result<string>> MarkAsReadAsync(int notificationId, string userId)
//     {
//         var notification = await _notificationRepo.GetByIdAsync(notificationId, userId);
//         if (notification == null)
//             return Result<string>.NotFound("Không tìm thấy thông báo hoặc bạn không có quyền.");

//         notification.IsRead = true;
//         _notificationRepo.Update(notification);
//         await _notificationRepo.SaveChangesAsync();
//         return Result<string>.Ok(message: "Đã đánh dấu thông báo là đã đọc.");
//     }

//     public async Task<Result<string>> MarkAllAsReadAsync(string userId)
//     {
//         var notifications = await _notificationRepo.GetByUserIdAsync(userId);
//         var unreadOnes = notifications.Where(n => n.IsRead == false || n.IsRead == null).ToList();

//         foreach (var n in unreadOnes)
//         {
//             n.IsRead = true;
//             _notificationRepo.Update(n);
//         }

//         await _notificationRepo.SaveChangesAsync();
//         return Result<string>.Ok(message: "Đã đánh dấu tất cả thông báo là đã đọc.");
//     }

//     public async Task<Result<string>> DeleteNotificationAsync(int notificationId, string userId)
//     {
//         var notification = await _notificationRepo.GetByIdAsync(notificationId, userId);
//         if (notification == null)
//             return Result<string>.NotFound("Không thể xóa thông báo.");

//         _notificationRepo.Delete(notification);
//         await _notificationRepo.SaveChangesAsync();
//         return Result<string>.Ok(message: "Đã xóa thông báo thành công.");
//     }

//     // Không đổi vì được gọi nội bộ từ các Service khác
//     public async Task CreateNotificationAsync(string userId, string message, string type, string? link)
//     {
//         var notification = new Notification
//         {
//             UserId = userId,
//             Message = message,
//             Type = type,
//             Link = link,
//             IsRead = false,
//             CreatedAt = DateTime.Now
//         };

//         await _notificationRepo.AddAsync(notification);
//         await _notificationRepo.SaveChangesAsync();
//     }
// }
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
                IsRead = n.IsRead,
                CreatedAt = n.UpdatedAt ?? n.CreatedAt, // Ưu tiên ngày cập nhật mới nhất
                LastActorName = n.LastActor?.FullName ?? "Người dùng",
                LastActorAvatar = n.LastActor?.ProfilePicture,
                ActorsCount = n.ActorsCount
            })
        );
    }

    public async Task CreateOrUpdateInteractionNotificationAsync(
        string receiverId,
        string actorId,
        string type,
        string link,
        string message,
        int currentCount)
    {
        // 1. Xử lý UNLIKE: Nếu không còn ai tương tác, xóa thông báo
        if (currentCount <= 0)
        {
            var existingNotify = await _notificationRepo.GetExistingNotificationAsync(receiverId, type, link);
            if (existingNotify != null)
            {
                _notificationRepo.Delete(existingNotify);
                await _notificationRepo.SaveChangesAsync();
            }
            return;
        }

        // 2. Tìm thông báo gom nhóm hiện có cho bài viết này
        var notify = await _notificationRepo.GetExistingNotificationAsync(receiverId, type, link);

        if (notify == null)
        {
            await _notificationRepo.AddAsync(new Notification
            {
                UserId = receiverId,
                LastActorId = actorId,
                ActorsCount = currentCount,
                Message = message, // Lưu ý: Message nên là phần thân (ví dụ: "đã thích bài viết")
                Type = type,
                Link = link,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            // CẬP NHẬT: Nếu là thông báo cũ, đẩy nó lên đầu và cập nhật người gửi mới nhất
            notify.LastActorId = actorId;
            notify.ActorsCount = currentCount;
            notify.IsRead = false;
            notify.UpdatedAt = DateTime.UtcNow;
            notify.Message = message; // Cập nhật lại nội dung nếu cần
            _notificationRepo.Update(notify);
        }
        await _notificationRepo.SaveChangesAsync();
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
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepo.AddAsync(notification);
        await _notificationRepo.SaveChangesAsync();
    }

    public async Task<Result<int>> GetUnreadCountAsync(string userId)
    {
        var count = await _notificationRepo.CountUnreadAsync(userId);
        return Result<int>.Ok(count);
    }

    public async Task<Result<string>> MarkAsReadAsync(int notificationId, string userId)
    {
        var notification = await _notificationRepo.GetByIdAndUserAsync(notificationId, userId);
        if (notification == null)
            return Result<string>.NotFound("Không tìm thấy thông báo.");

        notification.IsRead = true;
        _notificationRepo.Update(notification);
        await _notificationRepo.SaveChangesAsync();
        return Result<string>.Ok("Đã đánh dấu là đã đọc.");
    }

    public async Task<Result<string>> MarkAllAsReadAsync(string userId)
    {
        var notifications = await _notificationRepo.GetByUserIdAsync(userId);
        foreach (var n in notifications.Where(n => !n.IsRead))
        {
            n.IsRead = true;
            _notificationRepo.Update(n);
        }
        await _notificationRepo.SaveChangesAsync();
        return Result<string>.Ok("Đã đọc tất cả.");
    }

    public async Task<Result<string>> DeleteNotificationAsync(int notificationId, string userId)
    {
        var notification = await _notificationRepo.GetByIdAndUserAsync(notificationId, userId);
        if (notification == null)
            return Result<string>.NotFound("Không thể xóa thông báo.");

        _notificationRepo.Delete(notification);
        await _notificationRepo.SaveChangesAsync();
        return Result<string>.Ok("Đã xóa thông báo.");
    }
    public async Task DeleteNotificationByLogicAsync(string receiverId, string type, string link)
{
    // Tìm thông báo cũ dựa trên các tiêu chí định danh
    var existingNotify = await _notificationRepo.GetExistingNotificationAsync(receiverId, type, link);
    
    if (existingNotify != null)
    {
        // Gọi hàm xóa của Repository (NotificationRepository kế thừa từ Repository<T>)
        _notificationRepo.Delete(existingNotify);
    }
}
}