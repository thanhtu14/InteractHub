using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

public class Story
{
    [Key]
    public int Id { get; set; }

    public string? Content { get; set; }

    public string? MediaUrl { get; set; }

    public string? UserId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? ExpiredAt { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }
}