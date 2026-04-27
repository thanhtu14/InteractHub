using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

public enum MessageType
{
    Text = 0,
    Image = 1,
    Video = 2,
    Audio = 3,
    File = 4,
    PostShare = 5,
    Sticker = 6
}
[Table("Messages")]
public class Message
{
    [Key] public long Id { get; set; }
    public long ConversationId { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string? Content { get; set; }
    public MessageType MessageType { get; set; } = MessageType.Text;
    public bool IsRead { get; set; } = false;      // ✅ gộp luôn, đủ cho chat 1-1
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual Conversation Conversation { get; set; } = null!;
    public virtual User Sender { get; set; } = null!;
    public virtual ICollection<MessageMedia> Medias { get; set; } = new List<MessageMedia>();
}