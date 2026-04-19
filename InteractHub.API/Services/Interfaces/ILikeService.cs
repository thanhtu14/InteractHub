using InteractHub.API.DTOs.Likes;
using InteractHub.API.Common.Responses;

namespace InteractHub.API.Services.Interfaces;


public interface ILikeService
{
    Task<Result<LikeResponseDTO?>> ReactAsync(string userId, LikeRequestDTO request);
    Task<Result<LikeStateDTO>> GetLikeStateAsync(string? userId, int postId);
    Task<Result<IEnumerable<LikeResponseDTO>>> GetPostLikesDetailAsync(int postId, string? type);
}