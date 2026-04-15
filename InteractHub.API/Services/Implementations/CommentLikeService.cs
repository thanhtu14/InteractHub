
// Services/Implementations/CommentLikeService.cs
using InteractHub.API.DTOs.Comments;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;

namespace InteractHub.API.Services.Implementations;

public class CommentLikeService : ICommentLikeService
{
    private readonly ICommentLikeRepository _likeRepo;
    private readonly ICommentRepository _commentRepo;

    public CommentLikeService(
        ICommentLikeRepository likeRepo,
        ICommentRepository commentRepo)
    {
        _likeRepo = likeRepo;
        _commentRepo = commentRepo;
    }

    public async Task<CommentLikeResponseDTO?> ToggleAsync(string userId, int commentId)
    {
        // 1. Kiểm tra comment tồn tại
        var comment = await _commentRepo.GetByIdAsync(commentId);
        if (comment == null) return null;

        // 2. Toggle like
        var isAlreadyLiked = await _likeRepo.ExistsAsync(userId, commentId);

        if (isAlreadyLiked)
        {
            var existing = await _likeRepo.GetByUserAndCommentAsync(userId, commentId);
            if (existing != null)
                _likeRepo.Delete(existing);
        }
        else
        {
            await _likeRepo.AddAsync(new CommentLike
            {
                UserId = userId,
                CommentId = commentId,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _likeRepo.SaveChangesAsync();

        // 3. Reload để đếm like chính xác từ DB
        var updated = await _commentRepo.GetByIdWithUserAsync(commentId);
        var likeCount = updated?.CommentLikes?.Count ?? 0;

        return new CommentLikeResponseDTO
        {
            CommentId = commentId,
            LikeCount = likeCount,
            IsLiked = !isAlreadyLiked
        };
    }
}