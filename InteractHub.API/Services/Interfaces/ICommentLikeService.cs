using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Comments;

namespace InteractHub.API.Services.Interfaces;

public interface ICommentLikeService
{
    Task<Result<CommentLikeResponseDTO>> ToggleAsync(string userId, int commentId);
}