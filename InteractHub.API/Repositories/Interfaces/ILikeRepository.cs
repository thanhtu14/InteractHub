using InteractHub.API.Entities;

namespace InteractHub.API.Repositories.Interfaces;
public interface ILikeRepository
{
    Task<Like?> GetByUserAndPostAsync(string userId, int postId);
    Task<List<Like>> GetByPostIdAsync(int postId);
    
    // Thêm dòng này để Service có thể gọi
    Task<Dictionary<string, int>> GetBreakdownByPostIdAsync(int postId);

    Task AddAsync(Like like);
    Task DeleteAsync(Like like);
    Task SaveChangesAsync();
}