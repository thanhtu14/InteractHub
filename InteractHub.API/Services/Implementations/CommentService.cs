using InteractHub.API.DTOs.Comments;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;

namespace InteractHub.API.Services.Implementations;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepo;

    public CommentService(ICommentRepository commentRepo)
    {
        _commentRepo = commentRepo;
    }

    public async Task<CommentResponseDTO?> AddAsync(string userId, CommentRequestDTO request)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(request.Content))
            return null;

        if (!await _commentRepo.PostExistsAsync(request.PostId))
            return null;

        var comment = new Comment
        {
            UserId = userId,
            PostId = request.PostId,
            Content = request.Content.Trim(),
            ParentId = request.ParentId,
            CreatedAt = DateTime.UtcNow,
            Status = 1
        };

        await _commentRepo.AddAsync(comment);
        await _commentRepo.SaveChangesAsync();

        var saved = await _commentRepo.GetByIdWithUserAsync(comment.Id);

        string? parentName = null;
        if (request.ParentId.HasValue)
        {
            var parent = await _commentRepo.GetByIdWithUserAsync(request.ParentId.Value);
            parentName = parent?.User?.FullName;
        }

        return saved == null ? null : MapToResponseSingle(saved, userId, parentName);
    }

    public async Task<CommentResponseDTO?> UpdateAsync(string userId, int commentId, string content)
    {
        var comment = await _commentRepo.GetByIdAsync(commentId);
        if (comment == null || comment.UserId != userId) return null;

        comment.Content = content.Trim();
        _commentRepo.Update(comment);
        await _commentRepo.SaveChangesAsync();

        // QUAN TRỌNG: Phải dùng GetByIdWithUserAsync để nó Include(c => c.CommentLikes)
        var updated = await _commentRepo.GetByIdWithUserAsync(commentId);

        // Trả về kèm theo userId để IsLikedByCurrentUser tính toán đúng
        return updated == null ? null : MapToResponseSingle(updated, userId);
    }

    public async Task<bool> DeleteAsync(string userId, int commentId)
    {
        var comment = await _commentRepo.GetByIdAsync(commentId);
        if (comment == null || comment.UserId != userId) return false;

        comment.Status = 0;
        _commentRepo.Update(comment);
        await _commentRepo.SaveChangesAsync();
        return true;
    }

    // ====================== PHẦN THAY ĐỔI CHÍNH ======================
    public async Task<IEnumerable<CommentResponseDTO>> GetByPostIdAsync(int postId, string? currentUserId = null)
    {
        // 1. Lấy danh sách RootComments (mỗi root đã có Replies phẳng từ Repo)
        var rootComments = await _commentRepo.GetByPostIdAsync(postId);

        // 2. Tạo một Dictionary chứa Tên của tất cả comment để tra cứu nhanh cho @Mention
        // Chúng ta cần duyệt qua cả root và các con trong Replies để lấy đủ danh sách ID -> Name
        var nameMap = new Dictionary<int, string>();
        foreach (var root in rootComments)
        {
            if (root.User != null) nameMap[root.Id] = root.User.FullName;
            if (root.Replies != null)
            {
                foreach (var reply in root.Replies)
                {
                    if (reply.User != null) nameMap[reply.Id] = reply.User.FullName;
                }
            }
        }

        // 3. Map từ Entity sang DTO dùng Dictionary để lấy ParentUserName chính xác
        return rootComments.Select(root => MapToResponseWithMap(root, currentUserId, nameMap));
    }

    // Hàm Map dành cho danh sách (Sử dụng Map tra cứu tên)
    private static CommentResponseDTO MapToResponseWithMap(Comment c, string? currentUserId, Dictionary<int, string> nameMap)
    {
        var dto = MapToBaseDto(c, currentUserId);

        // Lấy tên cha trực tiếp từ Dictionary dựa trên ParentId
        if (c.ParentId.HasValue && nameMap.TryGetValue(c.ParentId.Value, out var pName))
        {
            dto.ParentUserName = pName;
        }

        // Map danh sách Replies phẳng
        if (c.Replies != null)
        {
            dto.Replies = c.Replies.Select(r =>
            {
                var replyDto = MapToBaseDto(r, currentUserId);
                // Với mỗi thằng con, tìm tên của thằng cha trực tiếp của nó
                if (r.ParentId.HasValue && nameMap.TryGetValue(r.ParentId.Value, out var replyPName))
                {
                    replyDto.ParentUserName = replyPName;
                }
                return replyDto;
            }).ToList();
        }

        return dto;
    }

    // Hàm Map cho trường hợp thêm mới (Single)
    private static CommentResponseDTO MapToResponseSingle(Comment c, string? currentUserId, string? pName = null)
    {
        var dto = MapToBaseDto(c, currentUserId);
        dto.ParentUserName = pName;
        return dto;
    }

    // Hàm Map các thuộc tính chung để tránh lặp code
    private static CommentResponseDTO MapToBaseDto(Comment c, string? currentUserId)
    {
        return new CommentResponseDTO
        {
            Id = c.Id,
            Content = c.Content ?? "",
            UserId = c.UserId ?? "",
            UserName = c.User?.FullName ?? "Ẩn danh",
            UserAvatar = c.User?.ProfilePicture,
            PostId = c.PostId,
            ParentId = c.ParentId,
            CreatedAt = c.CreatedAt ?? DateTime.UtcNow,
            LikeCount = c.CommentLikes?.Count ?? 0,
            IsLikedByCurrentUser = !string.IsNullOrEmpty(currentUserId)
                && c.CommentLikes != null
                && c.CommentLikes.Any(l => l.UserId == currentUserId),
            Replies = new List<CommentResponseDTO>()
        };
    }
}