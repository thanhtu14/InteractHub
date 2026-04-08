using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

public class Notification
{
    [Key]
    public int Id { get; set; }

    public string? UserId { get; set; }

    public string? Message { get; set; }

    public string? Type { get; set; }

    public bool? IsRead { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int? Status { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }
}
