using InteractHub.API.Entities;

namespace InteractHub.API.Repositories.Interfaces;

public interface IStoryRepository
{
    Task<List<Story>> GetAllAsync();
    Task<Story?> GetByIdAsync(int id);
    Task<List<Story>> GetByUserIdAsync(string userId);
    Task<Story> CreateAsync(Story story);
    Task<bool> UpdateAsync(Story story);
    Task<bool> DeleteAsync(int id);
}