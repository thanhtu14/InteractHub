using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

[Table("Notification")]
public class Notification
{
    [Key]
    public int Id { get; set; }

    [Required] // Bắt buộc phải có người nhận
    public string UserId { get; set; } = string.Empty;   

    public string? Message { get; set; }

    [Required] // Bắt buộc có loại để gom nhóm
    public string Type { get; set; } = string.Empty;

    public string? Link { get; set; }

    public string? LastActorId { get; set; }

    public int ActorsCount { get; set; } = 1;

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; } // Thêm virtual

    [ForeignKey("LastActorId")]
    public virtual User? LastActor { get; set; } // Thêm virtual
}