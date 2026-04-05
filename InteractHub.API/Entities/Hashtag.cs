using System;
using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.Entities;

public class Hashtag
{
    [Key]
    public int Id { get; set; }

    public string? Tag { get; set; }

    public DateTime? CreatedAt { get; set; }

    public ICollection<Post_Hashtag>? Post_Hashtags { get; set; }
}
