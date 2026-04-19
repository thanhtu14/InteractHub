using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Likes;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;

namespace InteractHub.API.Services.Implementations;

public class LikeService : ILikeService
{
    private readonly ILikeRepository _repo;

    public LikeService(ILikeRepository repo) => _repo = repo;

    public async Task<Result<LikeResponseDTO?>> ReactAsync(string userId, LikeRequestDTO request)
    {
        var existing = await _repo.GetByUserAndPostAsync(userId, request.PostId);

        if (!Enum.TryParse<ReactionType>(request.Type, true, out var incomingType))
            incomingType = ReactionType.Like;

        if (existing != null && existing.Type == incomingType)
        {
            await _repo.DeleteAsync(existing);
            await _repo.SaveChangesAsync();
            return Result<LikeResponseDTO?>.Ok(null, "Unliked");
        }

        if (existing != null)
        {
            existing.Type = incomingType;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
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