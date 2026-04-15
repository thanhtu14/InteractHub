using InteractHub.API.DTOs.Comments;

namespace InteractHub.API.Services.Interfaces;

public interface ICommentService
{
    Task<CommentResponseDTO?> AddAsync(string userId, CommentRequestDTO request);
    Task<CommentResponseDTO?> UpdateAsync(string userId, int commentId, string content);
    Task<bool> DeleteAsync(string userId, int commentId);
    Task<IEnumerable<CommentResponseDTO>> GetByPostIdAsync(int postId, string? currentUserId = null);
}