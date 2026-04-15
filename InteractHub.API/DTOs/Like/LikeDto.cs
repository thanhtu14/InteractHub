namespace InteractHub.API.DTOs.Likes;

public class LikeRequestDTO
{
    public int PostId { get; set; }
    public string Type { get; set; } = "Like";
}
public class LikeStateDTO
{
    public string? UserReaction { get; set; }
    public int Total { get; set; }
    public Dictionary<string, int> Breakdown { get; set; } = new();
}
public class LikeResponseDTO
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public int PostId { get; set; }
    public string Type { get; set; } = null!; // like, love, haha...
    public DateTime CreatedAt { get; set; }

    // Thêm 2 trường này để hiện Avatar và Tên trong Modal
    public string FullName { get; set; } = null!;
    public string? Avatar { get; set; }
}