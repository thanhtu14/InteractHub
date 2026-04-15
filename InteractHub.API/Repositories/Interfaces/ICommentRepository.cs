using InteractHub.API.Entities;

namespace InteractHub.API.Repositories.Interfaces;

public interface ICommentRepository : IRepository<Comment>
{
    Task<IEnumerable<Comment>> GetByPostIdAsync(int postId);
    Task<Comment?> GetByIdWithUserAsync(int commentId);   // Dùng để load User khi tạo mới
                                                          // Trong Repositories/Interfaces/ICommentRepository.cs
    Task<bool> CheckLikeExistsAsync(string userId, int commentId);
    Task AddLikeAsync(string userId, int commentId);
    Task RemoveLikeAsync(string userId, int commentId);
    Task<bool> PostExistsAsync(int postId);
    Task<bool> ParentCommentExistsAsync(int parentId);
}