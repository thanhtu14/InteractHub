using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

[Table("Notification")] // Đảm bảo mapping đúng tên bảng
public class Notification
{
    [Key]
    public int Id { get; set; }

    public string? UserId { get; set; }

    public string? Message { get; set; }

    public string? Type { get; set; }

    // --- CỘT MỚI THÊM ---
    public string? Link { get; set; } 

    public bool? IsRead { get; set; } = false;

    public DateTime? CreatedAt { get; set; }

    public int? Status { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }
}