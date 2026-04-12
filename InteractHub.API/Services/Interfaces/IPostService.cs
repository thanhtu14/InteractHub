using InteractHub.API.DTOs.Posts;

namespace InteractHub.API.Services.Interfaces;

public interface IPostService
{
    // Tạo bài viết mới
    Task<PostResponseDto> CreatePostAsync(string userId, PostCreateDto dto);

    // Lấy danh sách bài viết trên bảng tin
    Task<IEnumerable<PostResponseDto>> GetTimelineAsync();

    // Lấy danh sách bài viết của một người dùng cụ thể
    Task<IEnumerable<PostResponseDto>> GetPostsByUserIdAsync(string userId);

    // Lấy chi tiết một bài viết
    Task<PostResponseDto> GetPostByIdAsync(int postId);

    // Xóa bài viết (cần kiểm tra quyền sở hữu)
    Task DeletePostAsync(int postId, string userId);
    Task<PostResponseDto> UpdatePostAsync(int postId, string userId, PostUpdateDto dto);
}