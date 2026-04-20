using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Likes;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore; // Đảm bảo có cái này để dùng .Count() hoặc các extension khác

namespace InteractHub.API.Services.Implementations;

public class LikeService : ILikeService
{
    private readonly ILikeRepository _repo;
    private readonly INotificationService _notificationService;

    public LikeService(ILikeRepository repo, INotificationService notificationService)
    {
        _repo = repo;
        _notificationService = notificationService;
    }

    public async Task<Result<LikeResponseDTO?>> ReactAsync(string userId, LikeRequestDTO request)
    {
        // QUAN TRỌNG: Repo này phải Include Post thì mới có UserId của chủ bài viết
        var existing = await _repo.GetByUserAndPostAsync(userId, request.PostId);

        if (!Enum.TryParse<ReactionType>(request.Type, true, out var incomingType))
            incomingType = ReactionType.Like;

        // --- TRƯỜNG HỢP 1: UNLIKE (Xóa Like) ---
        if (existing != null && existing.Type == incomingType)
        {
            // Lưu lại thông tin trước khi xóa để gửi thông báo/xử lý logic
            var postOwnerId = existing.Post?.UserId; 
            
            await _repo.DeleteAsync(existing);
            await _repo.SaveChangesAsync();

            // ✅ XÓA THÔNG BÁO khi người dùng Unlike
            if (!string.IsNullOrEmpty(postOwnerId))
            {
                await _notificationService.DeleteNotificationByLogicAsync(
                    postOwnerId,
                    "POST_LIKE",
                    $"/post/{request.PostId}"
                );
            }

            return Result<LikeResponseDTO?>.Ok(null, "Unliked");
        }

        // --- TRƯỜNG HỢP 2 & 3: LIKE MỚI HOẶC ĐỔI REACTION ---
        if (existing != null)
        {
            existing.Type = incomingType;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.Status = 1; // Đảm bảo status luôn active khi re-react
        }
        else
        {
            existing = new Like
            {
                UserId = userId,
                PostId = request.PostId,
                Type = incomingType,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Status = 1
            };
            await _repo.AddAsync(existing);
        }

        // Lưu xuống DB để các lệnh đếm phía sau chính xác
        await _repo.SaveChangesAsync();

        // Nạp lại dữ liệu bao gồm cả Post để tránh ownerId bị Null
        // Nếu Repo của Vinh chưa Include Post, dòng dưới đây là "cứu cánh":
        var allLikes = await _repo.GetByPostIdAsync(request.PostId);
        var currentLikeWithPost = allLikes.FirstOrDefault(x => x.UserId == userId);
        var ownerId = currentLikeWithPost?.Post?.UserId;

        // --- XỬ LÝ GỬI THÔNG BÁO (GOM NHÓM) ---
        if (!string.IsNullOrEmpty(ownerId) && ownerId != userId)
        {
            int totalLikes = allLikes.Count();
            
            // Log để Vinh kiểm tra trong console xem nó có chạy vào đây không
            Console.WriteLine($"[DEBUG] Notification Triggered: Owner={ownerId}, Actor={userId}, Total={totalLikes}");

            await _notificationService.CreateOrUpdateInteractionNotificationAsync(
                ownerId,           // Người nhận (Chủ bài viết)
                userId,            // Người tương tác cuối (LastActor)
                "POST_LIKE",       // Loại
                $"/post/{request.PostId}", // Link dùng để định danh gom nhóm
                "đã bày tỏ cảm xúc về bài viết của bạn.", // Message gốc
                totalLikes         // Tổng số người đã like
            );
        }
        else
        {
            Console.WriteLine($"[DEBUG] Notification Skipped: OwnerId is null or same as Actor. OwnerId: {ownerId}");
        }

        return Result<LikeResponseDTO?>.Ok(Map(existing), "Reacted");
    }

    public async Task<Result<LikeStateDTO>> GetLikeStateAsync(string? userId, int postId)
    {
        var breakdown = await _repo.GetBreakdownByPostIdAsync(postId);
        var allLikes = await _repo.GetByPostIdAsync(postId);
        var userLike = userId == null ? null : allLikes.FirstOrDefault(x => x.UserId == userId);

        return Result<LikeStateDTO>.Ok(new LikeStateDTO
        {
            Total = breakdown.Values.Sum(),
            UserReaction = userLike?.Type.ToString().ToLower(),
            Breakdown = breakdown
        });
    }

    public async Task<Result<IEnumerable<LikeResponseDTO>>> GetPostLikesDetailAsync(int postId, string? type)
    {
        var likes = await _repo.GetByPostIdAsync(postId);

        if (!string.IsNullOrEmpty(type) && Enum.TryParse<ReactionType>(type, true, out var filterType))
            likes = likes.Where(x => x.Type == filterType).ToList();

        return Result<IEnumerable<LikeResponseDTO>>.Ok(likes.Select(Map));
    }

    private LikeResponseDTO Map(Like entity) => new()
    {
        Id = entity.Id,
        UserId = entity.UserId,
        PostId = entity.PostId,
        Type = entity.Type.ToString().ToLower(),
        CreatedAt = entity.CreatedAt,
        FullName = entity.User?.FullName ?? "Người dùng hệ thống",
        Avatar = entity.User?.ProfilePicture ?? ""
    };
}