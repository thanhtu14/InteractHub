using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Comments;

namespace InteractHub.API.Services.Interfaces;

public interface ICommentService
{
    Task<Result<CommentResponseDTO>> AddAsync(string userId, CommentRequestDTO request);
    Task<Result<CommentResponseDTO>> UpdateAsync(string userId, int commentId, string content);
    Task<Result<string>> DeleteAsync(string userId, int commentId);
    Task<Result<IEnumerable<CommentResponseDTO>>> GetByPostIdAsync(int postId, string? currentUserId = null);
}