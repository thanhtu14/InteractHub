using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

public class Post_Hashtag
{
    [Key]
    public int  PostId{ get; set; }

    public int HashtagId { get; set; }

    [ForeignKey("PostId")]
    public Post? Post { get; set; }

    [ForeignKey("HashtagId")]
    public Hashtag? Hashtag { get; set; }
}
