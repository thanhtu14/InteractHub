using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

// 1. Khai báo Enum để quản lý các loại cảm xúc
public enum ReactionType
{
    Like = 0,
    Love = 1,
    Haha = 2,
    Wow = 3,
    Sad = 4,
    Angry = 5
}

public class Like
{
    [Key]
    public int Id { get; set; }

    // ================= USER =================
    [Required]
    public string UserId { get; set; } = null!;

    // ================= POST =================
    [Required]
    public int PostId { get; set; }

    // ================= REACTION TYPE =================
    [Required]
    // 2. Đổi kiểu dữ liệu từ string sang Enum ReactionType
    public ReactionType Type { get; set; } = ReactionType.Like;

    // ================= AUDIT =================
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // ================= STATUS =================
    public int Status { get; set; } = 1;

    // ================= NAVIGATION =================
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [ForeignKey(nameof(PostId))]
    public Post? Post { get; set; }
}