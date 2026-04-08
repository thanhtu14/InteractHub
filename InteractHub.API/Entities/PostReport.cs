using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

public class PostReport
{
    [Key]
    public int Id { get; set; }

    public int PostId { get; set; }

    public string? UserId { get; set; }

    public string? Reason { get; set; }

    public DateTime? CreatedAt { get; set; }

    [ForeignKey("PostId")]
    public Post? Post { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }
}
