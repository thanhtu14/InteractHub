using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace InteractHub.API.Entities;

[Table("CommentLike")]
public class CommentLike
{

    public int CommentId { get; set; }
    public string? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("CommentId")]
    public Comment? Comment { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }
}