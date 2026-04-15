using InteractHub.API.DTOs.Likes;
namespace InteractHub.API.Services.Interfaces;
public interface ILikeService
{
    Task<LikeResponseDTO?> ReactAsync(string userId, LikeRequestDTO request);

    Task<LikeStateDTO> GetLikeStateAsync(string? userId, int postId);

    Task<IEnumerable<LikeResponseDTO>> GetPostLikesDetailAsync(int postId, string? type);
}