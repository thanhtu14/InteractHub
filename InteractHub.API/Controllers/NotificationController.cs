using System.Security.Claims;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize] // Hầu hết các thao tác với thông báo đều cần đăng nhập
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    // ── 1. GET api/notifications ──────────────────────────────────
    // Lấy tất cả thông báo của người dùng hiện tại
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var notifications = await _notificationService.GetNotificationsByUserIdAsync(userId);
        return Ok(notifications);
    }

    // ── 2. GET api/notifications/unread-count ─────────────────────
    // Đếm số lượng thông báo chưa đọc (để hiển thị badge trên UI)
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(new { unreadCount = count });
    }

    // ── 3. PUT api/notifications/{id}/read ────────────────────────
    // Đánh dấu một thông báo cụ thể là đã đọc
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var success = await _notificationService.MarkAsReadAsync(id, userId);
        if (!success) return NotFound(new { message = "Không tìm thấy thông báo hoặc bạn không có quyền." });

        return Ok(new { message = "Đã đánh dấu thông báo là đã đọc." });
    }

    // ── 4. PUT api/notifications/read-all ─────────────────────────
    // Đánh dấu tất cả thông báo là đã đọc
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(new { message = "Đã đánh dấu tất cả thông báo là đã đọc." });
    }

    // ── 5. DELETE api/notifications/{id} ──────────────────────────
    // Xóa một thông báo
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var success = await _notificationService.DeleteNotificationAsync(id, userId);
        if (!success) return NotFound(new { message = "Không thể xóa thông báo." });

        return Ok(new { message = "Đã xóa thông báo thành công." });
    }
}