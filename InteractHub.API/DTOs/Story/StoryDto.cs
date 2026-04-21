namespace InteractHub.API.DTOs.Story;

public class CreateStoryDTO
{
    public string? Content { get; set; }
    public IFormFile? File { get; set; }
    public string? MediaUrl { get; set; }
}

public class UpdateStoryDTO
{
    public string? Content { get; set; }
    public string? MediaUrl { get; set; }
}
public class StoryDTO
{
    public int Id { get; set; }
    public string? Content { get; set; }
    public string? MediaUrl { get; set; }
    public string? UserId { get; set; }
    public string? FullName { get; set; }
    public string? ProfilePicture { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? ExpiredAt { get; set; }
}