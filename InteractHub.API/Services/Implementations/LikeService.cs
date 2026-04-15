using InteractHub.API.DTOs.Likes;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;

namespace InteractHub.API.Services.Implementations;

public class LikeService : ILikeService
{
    private readonly ILikeRepository _repo;

    public LikeService(ILikeRepository repo) => _repo = repo;

    public async Task<LikeResponseDTO?> ReactAsync(string userId, LikeRequestDTO request)
    {
        var existing = await _repo.GetByUserAndPostAsync(userId, request.PostId);

        // 1. Chuyển string từ Request sang Enum ReactionType
        // Nếu parse lỗi hoặc trống thì mặc định là Like
        if (!Enum.TryParse<ReactionType>(request.Type, true, out var incomingType))
        {
            incomingType = ReactionType.Like;
        }

        // 2. Kiểm tra nếu đã tồn tại reaction cùng loại -> Xóa (Unlike)
        if (existing != null && existing.Type == incomingType)
        {
            await _repo.DeleteAsync(existing);
            await _repo.SaveChangesAsync();
            return null;
        }

        if (existing != null)
        {
            // Chỉ cần gán giá trị mới, EF Core sẽ tự hiểu đây là một bản cập nhật
            existing.Type = incomingType;
            existing.UpdatedAt = DateTime.UtcNow;

            // Xóa hoặc comment dòng này nếu không có hàm UpdateAsync trong Repo
            // await _repo.UpdateAsync(existing); 
        }
        else
        {
            // Tạo mới reaction
            existing = new Like
            {
                UserId = userId,
                PostId = request.PostId,
                Type = incomingType,
                CreatedAt = DateTime.UtcNow
            };
            await _repo.AddAsync(existing);
        }

        await _repo.SaveChangesAsync();
        return Map(existing);
    }

    public async Task<LikeStateDTO> GetLikeStateAsync(string? userId, int postId)
    {
        // Lấy thống kê Breakdown (đã được Repository cast sang string)
        var breakdown = await _repo.GetBreakdownByPostIdAsync(postId);

        // Lấy toàn bộ like của post để tìm reaction của user hiện tại
        var allLikes = await _repo.GetByPostIdAsync(postId);
        var userLike = userId == null ? null : allLikes.FirstOrDefault(x => x.UserId == userId);

        return new LikeStateDTO
        {
            Total = breakdown.Values.Sum(),
            // Trả về string viết thường cho Frontend dễ xử lý
            UserReaction = userLike?.Type.ToString().ToLower(),
            Breakdown = breakdown
        };
    }

    public async Task<IEnumerable<LikeResponseDTO>> GetPostLikesDetailAsync(int postId, string? type)
    {
        var likes = await _repo.GetByPostIdAsync(postId);

        if (!string.IsNullOrEmpty(type) && Enum.TryParse<ReactionType>(type, true, out var filterType))
        {
            likes = likes.Where(x => x.Type == filterType).ToList();
        }

        return likes.Select(Map);
    }

    // Hàm Map chuyển đổi từ Entity sang DTO
   private LikeResponseDTO Map(Like entity)
{
    return new LikeResponseDTO
    {
        Id = entity.Id,
        UserId = entity.UserId,
        PostId = entity.PostId,
        Type = entity.Type.ToString().ToLower(),
        CreatedAt = entity.CreatedAt,
        
        // Lấy thông tin từ bảng User đã được Include ở trên
        FullName = entity.User?.FullName ?? "Người dùng hệ thống",
        Avatar = entity.User?.ProfilePicture ?? "" 
    };
}
}