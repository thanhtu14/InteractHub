using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

public class Friendship
{
    [Key]
    public int Id { get; set; }

    public string? RequesterId { get; set; } // người gửi

    public string? ReceiverId { get; set; } // người nhận

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    [ForeignKey("RequesterId")]
    public User? Requester { get; set; }

    [ForeignKey("ReceiverId")]
    public User? Receiver { get; set; }
}
