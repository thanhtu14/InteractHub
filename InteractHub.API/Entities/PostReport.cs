
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

public class PostReport
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int PostId { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Reason { get; set; } = string.Empty;

    public string? AdminNote { get; set; } // Ghi chú của Admin sau khi xem xét

    public int Status { get; set; } = 0; // 0: Chờ xử lý, 1: Đã xử lý (Giữ bài), 2: Đã xử lý (Xóa bài)

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ResolvedAt { get; set; } // Ngày Admin thực hiện xử lý

    // Navigation Properties
    [ForeignKey("PostId")]
    public virtual Post? Post { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
}