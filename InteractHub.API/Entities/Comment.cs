// Entities/Comment.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

public class Comment
{
    [Key]
    public int Id { get; set; }

    public string? Content { get; set; }

    public string? UserId { get; set; }

    public int PostId { get; set; }

    public int? ParentId { get; set; }        // null = comment gốc

    public DateTime? CreatedAt { get; set; }

    public int Status { get; set; } = 1;      // 1 = active, 0 = deleted

    // Navigation Properties
    [ForeignKey("UserId")]
    public User? User { get; set; }

    [ForeignKey("PostId")]
    public Post? Post { get; set; }

    [ForeignKey("ParentId")]
    public Comment? Parent { get; set; }

    public ICollection<Comment> Replies { get; set; } = new List<Comment>();
    // Trong Entities/Comment.cs
public virtual ICollection<CommentLike> CommentLikes { get; set; } = new List<CommentLike>();
}