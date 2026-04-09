

namespace InteractHub.API.DTOs.User;

public class FriendshipResponseDto
{
    public int Id { get; set; } // Hoặc Guid tùy kiểu dữ liệu của bạn
    public required string RequesterId { get; set; }
    public required string ReceiverId { get; set; }

    // Trạng thái: Pending, Accepted, Declined, Blocked
    public int? Status { get; set; }

    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Bạn có thể thêm các thông tin bổ sung để hiển thị trên UI
    public string? RequesterName { get; set; }
    public string? ReceiverName { get; set; }
    public string? AvatarUrl { get; set; }
}
