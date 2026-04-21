using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Story;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;

namespace InteractHub.API.Services.Implementations;

public class StoryService : IStoryService
{
    private readonly IStoryRepository _repo;

    public StoryService(IStoryRepository repo)
    {
        _repo = repo;
    }

    public async Task<Result<List<StoryDTO>>> GetAllAsync()
    {
        var stories = await _repo.GetAllAsync();
        return Result<List<StoryDTO>>.Ok(stories.Select(MapToDto).ToList());
    }

    public async Task<Result<StoryDTO>> GetByIdAsync(int id)
    {
        var story = await _repo.GetByIdAsync(id);
        return story == null
            ? Result<StoryDTO>.NotFound("Story không tồn tại.")
            : Result<StoryDTO>.Ok(MapToDto(story));
    }

    public async Task<Result<List<StoryDTO>>> GetByUserIdAsync(string userId)
    {
        var stories = await _repo.GetByUserIdAsync(userId);
        return Result<List<StoryDTO>>.Ok(stories.Select(MapToDto).ToList());
    }

    public async Task<Result<StoryDTO>> CreateAsync(CreateStoryDTO dto, string userId)
    {
        var story = new Story
        {
            Content   = dto.Content,
            MediaUrl  = dto.MediaUrl,
            UserId    = userId,
            CreatedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddHours(24)
        };

        var result = await _repo.CreateAsync(story);
        return Result<StoryDTO>.Ok(MapToDto(result), "Đăng tin thành công.");
    }

    public async Task<Result<string>> UpdateAsync(int id, UpdateStoryDTO dto)
    {
        var story = await _repo.GetByIdAsync(id);
        if (story == null)
            return Result<string>.NotFound("Story không tồn tại.");

        story.Content  = dto.Content  ?? story.Content;
        story.MediaUrl = dto.MediaUrl ?? story.MediaUrl;

        await _repo.UpdateAsync(story);
        return Result<string>.Ok(message: "Cập nhật tin thành công.");
    }

    public async Task<Result<string>> DeleteAsync(int id)
    {
        var deleted = await _repo.DeleteAsync(id);
        return deleted
            ? Result<string>.Ok(message: "Đã xóa tin thành công.")
            : Result<string>.NotFound("Story không tồn tại.");
    }

    private static StoryDTO MapToDto(Story s) => new()
    {
        Id             = s.Id,
        Content        = s.Content,
        MediaUrl       = s.MediaUrl,
        UserId         = s.UserId,
        FullName       = s.User?.FullName ?? "Người dùng",
        ProfilePicture = s.User?.ProfilePicture,
        CreatedAt      = s.CreatedAt,
        ExpiredAt      = s.ExpiredAt
    };
}