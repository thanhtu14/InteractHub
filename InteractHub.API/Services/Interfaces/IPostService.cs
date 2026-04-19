using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Posts;

namespace InteractHub.API.Services.Interfaces;

public interface IPostService
{
    Task<Result<PostResponseDto>> CreatePostAsync(string userId, PostCreateDto dto);
    Task<Result<IEnumerable<PostResponseDto>>> GetTimelineAsync();
    Task<Result<IEnumerable<PostResponseDto>>> GetPostsByUserIdAsync(string userId);
    Task<Result<PostResponseDto>> GetPostByIdAsync(int postId);
    Task<Result<string>> DeletePostAsync(int postId, string userId);
    Task<Result<PostResponseDto>> UpdatePostAsync(int postId, string userId, PostUpdateDto dto);
}