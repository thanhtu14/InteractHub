
using InteractHub.API.Entities;
namespace InteractHub.API.Repositories.Interfaces;



public interface ICommentLikeRepository : IRepository<CommentLike>
{
    Task<bool> ExistsAsync(string userId, int commentId);
    Task<CommentLike?> GetByUserAndCommentAsync(string userId, int commentId); // ✅ thêm dòng này
}