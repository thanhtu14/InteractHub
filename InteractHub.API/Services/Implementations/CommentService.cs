using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Comments;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;

namespace InteractHub.API.Services.Implementations;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepo;
    private readonly INotificationService _notificationService; // ✅ thêm

    public CommentService(ICommentRepository commentRepo, INotificationService notificationService) // ✅ thêm
    {
        _commentRepo = commentRepo;
        _notificationService = notificationService;
    }

    public async Task<Result<CommentResponseDTO>> AddAsync(string userId, CommentRequestDTO request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return Result<CommentResponseDTO>.BadRequest("Nội dung bình luận không được trống.");

        if (!await _commentRepo.PostExistsAsync(request.PostId))
            return Result<CommentResponseDTO>.NotFound("Bài viết không tồn tại.");

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

            // ✅ Gửi thông báo cho người được reply
            // Chỉ gửi nếu người reply khác người được reply
            if (parent != null
     && !string.IsNullOrEmpty(parent.UserId)
     && parent.UserId != userId)
            {
    var uniqueRepliersCount = await _commentRepo.CountUniqueRepliersAsync(request.ParentId.Value);

                await _notificationService.CreateOrUpdateInteractionNotificationAsync(
                    parent.UserId,                                        // người nhận
                    userId,                                               // người reply
                    "COMMENT_REPLY",                                      // type
                    $"/post/{request.PostId}#comment-{comment.Id}",       // link
                    "đã trả lời bình luận của bạn.",                      // message
                    uniqueRepliersCount                                            // tổng số reply
                );
            }
        }

        return saved == null
            ? Result<CommentResponseDTO>.ServerError("Không thể tạo bình luận.")
            : Result<CommentResponseDTO>.Ok(MapToResponseSingle(saved, userId, parentName), "Comment created successfully");
    }
    public async Task<Result<CommentResponseDTO>> UpdateAsync(string userId, int commentId, string content)
    {
        var comment = await _commentRepo.GetByIdAsync(commentId);
        if (comment == null)
            return Result<CommentResponseDTO>.NotFound("Bình luận không tồn tại.");
        if (comment.UserId != userId)
            return Result<CommentResponseDTO>.BadRequest("Bạn không có quyền sửa bình luận này.");

        comment.Content = content.Trim();
        _commentRepo.Update(comment);
        await _commentRepo.SaveChangesAsync();

        var updated = await _commentRepo.GetByIdWithUserAsync(commentId);
        return updated == null
            ? Result<CommentResponseDTO>.ServerError("Không thể cập nhật bình luận.")
            : Result<CommentResponseDTO>.Ok(MapToResponseSingle(updated, userId), "Comment updated successfully");
    }

    public async Task<Result<string>> DeleteAsync(string userId, int commentId)
    {
        var comment = await _commentRepo.GetByIdAsync(commentId);
        if (comment == null)
            return Result<string>.NotFound("Bình luận không tồn tại.");
        if (comment.UserId != userId)
            return Result<string>.BadRequest("Bạn không có quyền xóa bình luận này.");

        comment.Status = 0;
        _commentRepo.Update(comment);
        await _commentRepo.SaveChangesAsync();
        return Result<string>.Ok(message: "Comment deleted successfully");
    }

    public async Task<Result<IEnumerable<CommentResponseDTO>>> GetByPostIdAsync(int postId, string? currentUserId = null)
    {
        var rootComments = await _commentRepo.GetByPostIdAsync(postId);

        var nameMap = new Dictionary<int, string>();
        foreach (var root in rootComments)
        {
            if (root.User != null) nameMap[root.Id] = root.User.FullName ?? string.Empty;
            if (root.Replies != null)
                foreach (var reply in root.Replies)
                    if (reply.User != null) nameMap[reply.Id] = reply.User.FullName ?? string.Empty;
        }

        return Result<IEnumerable<CommentResponseDTO>>.Ok(
            rootComments.Select(root => MapToResponseWithMap(root, currentUserId, nameMap))
        );
    }

    private static CommentResponseDTO MapToResponseWithMap(Comment c, string? currentUserId, Dictionary<int, string> nameMap)
    {
        var dto = MapToBaseDto(c, currentUserId);

        if (c.ParentId.HasValue && nameMap.TryGetValue(c.ParentId.Value, out var pName))
            dto.ParentUserName = pName;

        if (c.Replies != null)
        {
            dto.Replies = c.Replies.Select(r =>
            {
                var replyDto = MapToBaseDto(r, currentUserId);
                if (r.ParentId.HasValue && nameMap.TryGetValue(r.ParentId.Value, out var replyPName))
                    replyDto.ParentUserName = replyPName;
                return replyDto;
            }).ToList();
        }

        return dto;
    }

    private static CommentResponseDTO MapToResponseSingle(Comment c, string? currentUserId, string? pName = null)
    {
        var dto = MapToBaseDto(c, currentUserId);
        dto.ParentUserName = pName;
        return dto;
    }

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