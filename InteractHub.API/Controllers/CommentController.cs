// Controllers/CommentsController.cs
using InteractHub.API.DTOs.Comments;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using InteractHub.API.Common.Responses;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/comments")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;
    private readonly ICommentLikeService _commentLikeService; // ✅ thêm

    public CommentsController(
        ICommentService commentService,
        ICommentLikeService commentLikeService) // ✅ thêm
    {
        _commentService = commentService;
        _commentLikeService = commentLikeService;
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    // ── CREATE COMMENT ───────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CommentRequestDTO request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _commentService.AddAsync(userId, request);

        return result == null
            ? Ok(ApiResponse<object>.Fail("Không thể tạo bình luận"))
            : Ok(ApiResponse<CommentResponseDTO>.Ok(result, "Comment created successfully"));
    }

    // ── UPDATE COMMENT ───────────────────────────────────────
    [HttpPut("{commentId}")]
    public async Task<IActionResult> Update(int commentId, [FromBody] CommentUpdateRequestDTO request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _commentService.UpdateAsync(userId, commentId, request.Content);

        return result == null
            ? Ok(ApiResponse<object>.Fail("Không thể cập nhật bình luận hoặc bạn không có quyền"))
            : Ok(ApiResponse<CommentResponseDTO>.Ok(result, "Comment updated successfully"));
    }

    // ── DELETE COMMENT ───────────────────────────────────────
    [HttpDelete("{commentId}")]
    public async Task<IActionResult> Delete(int commentId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var success = await _commentService.DeleteAsync(userId, commentId);

        return success
            ? Ok(ApiResponse<object>.Ok(null, "Comment deleted successfully"))
            : Ok(ApiResponse<object>.Fail("Không thể xóa bình luận hoặc bạn không có quyền"));
    }

    // ── GET COMMENTS BY POST ─────────────────────────────────
    [HttpGet("post/{postId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByPost(int postId)
    {
        var userId = GetUserId();
        var result = await _commentService.GetByPostIdAsync(postId, userId);
        return Ok(ApiResponse<IEnumerable<CommentResponseDTO>>.Ok(result));
    }

    // ── LIKE / UNLIKE COMMENT ────────────────────────────────
    [HttpPost("{commentId}/like")]
    public async Task<IActionResult> ToggleLike(int commentId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        // ✅ Gọi _commentLikeService thay vì _commentService
        var result = await _commentLikeService.ToggleAsync(userId, commentId);

        return result == null
            ? Ok(ApiResponse<object>.Fail("Comment không tồn tại"))
            : Ok(ApiResponse<CommentLikeResponseDTO>.Ok(result,
                result.IsLiked ? "Liked" : "Unliked"));
    }
}