using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

[Table("Post")]
public class Post
{ [Key]
    public int Id { get; set; }

    public string? Content { get; set; }

    public string? UserId { get; set; } // FK

    public DateTime? CreatedAt { get; set; }

    public int? Status { get; set; }

    public string? Title { get; set; }

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }

    public ICollection<Like>? Likes { get; set; }

    public ICollection<Comment>? Comments { get; set; }

    public ICollection<PostReport>? Reports { get; set; }

    public ICollection<Post_Hashtag>? Post_Hashtags { get; set; }
    public ICollection<PostMedia> PostMedias { get; set; } = new List<PostMedia>();

}
