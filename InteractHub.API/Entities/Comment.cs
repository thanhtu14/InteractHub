using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

public class Comment
{
    [Key]
    public int Id { get; set; }

    public string? Content { get; set; }

    public string? UserId { get; set; }  // int → string

    public int PostId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int? Status { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }

    [ForeignKey("PostId")]
    public Post? Post { get; set; }
}