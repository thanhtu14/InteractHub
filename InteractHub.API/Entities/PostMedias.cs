using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;
[Table("PostMedia")]
public class PostMedia
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Url { get; set; } = string.Empty;

    // Phân loại: 0 - Image, 1 - Video, v.v.
    public int MediaType { get; set; } 

    public int PostId { get; set; }

    [ForeignKey("PostId")]
    public Post? Post { get; set; }
}