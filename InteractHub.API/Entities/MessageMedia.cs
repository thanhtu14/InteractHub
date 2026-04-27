using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;
[Table("MessageMedias")]
public class MessageMedia
{
    [Key] public long Id { get; set; }
    public long MessageId { get; set; }
    public int MediaType { get; set; }             // 1:Image 2:Video 3:File
    public string MediaUrl { get; set; } = string.Empty;
    public string? FileName { get; set; }
    public long? FileSize { get; set; }

    public virtual Message Message { get; set; } = null!;
}