using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

public class User : IdentityUser  // Kế thừa IdentityUser
{
    // IdentityUser đã có sẵn: Id (string), UserName, Email, 
    // PasswordHash, PhoneNumber, ...

    [MaxLength(100)]
    public string? FullName { get; set; }

    public string? ProfilePicture { get; set; } // URL ảnh Azure Blob

    public DateTime? DateOfBirth { get; set; }

    [MaxLength(500)]
    public string? Bio { get; set; }

    public int Status { get; set; } = 1; // 1: Active, 0: Banned

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ===== Navigation =====
    public ICollection<Post>? Posts { get; set; }
    public ICollection<Story>? Stories { get; set; }
    public ICollection<Like>? Likes { get; set; }
    public ICollection<Comment>? Comments { get; set; }
    public ICollection<Notification>? Notifications { get; set; }
    public ICollection<PostReport>? PostReports { get; set; }

    [InverseProperty("Requester")]
    public ICollection<Friendship>? RequestedFriends { get; set; }

    [InverseProperty("Receiver")]
    public ICollection<Friendship>? ReceivedFriends { get; set; }
}