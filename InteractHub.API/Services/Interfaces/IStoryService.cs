using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Story;

namespace InteractHub.API.Services.Interfaces;

public interface IStoryService
{
    Task<Result<List<StoryDTO>>> GetAllAsync();
    Task<Result<StoryDTO>> GetByIdAsync(int id);
    Task<Result<List<StoryDTO>>> GetByUserIdAsync(string userId);
    Task<Result<StoryDTO>> CreateAsync(CreateStoryDTO dto, string userId);
    Task<Result<string>> UpdateAsync(int id, UpdateStoryDTO dto);
    Task<Result<string>> DeleteAsync(int id);
}