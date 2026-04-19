using InteractHub.API.Common.Extensions;
using InteractHub.API.DTOs.Comments;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/comments")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;
    private readonly ICommentLikeService _commentLikeService;

    public CommentsController(ICommentService commentService, ICommentLikeService commentLikeService)
    {
        _commentService = commentService;
        _commentLikeService = commentLikeService;
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CommentRequestDTO request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _commentService.AddAsync(userId, request);
        return result.ToActionResult(this);
    }

    [HttpPut("{commentId}")]
    public async Task<IActionResult> Update(int commentId, [FromBody] CommentUpdateRequestDTO request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _commentService.UpdateAsync(userId, commentId, request.Content);
        return result.ToActionResult(this);
    }

    [HttpDelete("{commentId}")]
    public async Task<IActionResult> Delete(int commentId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _commentService.DeleteAsync(userId, commentId);
        return result.ToActionResult(this);
    }

    [HttpGet("post/{postId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByPost(int postId)
    {
        var result = await _commentService.GetByPostIdAsync(postId, GetUserId());
        return result.ToActionResult(this);
    }

    [HttpPost("{commentId}/like")]
    public async Task<IActionResult> ToggleLike(int commentId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _commentLikeService.ToggleAsync(userId, commentId);
        return result.ToActionResult(this);
    }
}