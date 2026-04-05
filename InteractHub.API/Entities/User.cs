using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

[Table("User")] // Tên bảng trong cơ sở dữ liệu
public class User
{
    [Key] // Khóa chính
    public int Id { get; set; }

    public string? FullName { get; set; } // Họ tên

    public string? ProfilePicture { get; set; } // Ảnh đại diện

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string? Bio { get; set; } // Tiểu sử

    public string? UserName { get; set; }

    public string? Password { get; set; }

    public int? Status { get; set; }

    // ===== Navigation =====
    public ICollection<Post>? Posts { get; set; }

    public ICollection<Story>? Stories { get; set; }

    public ICollection<Like>? Likes { get; set; }

    public ICollection<Comment>? Comments { get; set; }

    public ICollection<Notification>? Notifications { get; set; }

    public ICollection<PostReport>? PostReports { get; set; }

    // Friendship (2 chiều)
    [InverseProperty("Requester")]
    public ICollection<Friendship>? RequestedFriends { get; set; }

    [InverseProperty("Receiver")]
    public ICollection<Friendship>? ReceivedFriends { get; set; }

}
