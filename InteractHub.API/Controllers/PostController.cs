using System.Security.Claims;
using InteractHub.API.Common.Extensions;
using InteractHub.API.DTOs.Posts;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/post")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;

    public PostsController(IPostService postService)
    {
        _postService = postService;
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreatePost([FromForm] PostCreateDto dto)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _postService.CreatePostAsync(userId, dto);
        return result.ToActionResult(this);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetTimeline()
    {
        var result = await _postService.GetTimelineAsync();
        return result.ToActionResult(this);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserPosts(string userId)
    {
        var result = await _postService.GetPostsByUserIdAsync(userId);
        return result.ToActionResult(this);
    }

    [HttpGet("{postId}")]
    public async Task<IActionResult> GetPostById(int postId)
    {
        var result = await _postService.GetPostByIdAsync(postId);
        return result.ToActionResult(this);
    }

    [HttpDelete("delete/{postId}")]
    [Authorize]
    public async Task<IActionResult> DeletePost(int postId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _postService.DeletePostAsync(postId, userId);
        return result.ToActionResult(this);
    }

    [HttpPut("update/{postId}")]
    [Authorize]
    public async Task<IActionResult> UpdatePost(int postId, [FromForm] PostUpdateDto dto)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _postService.UpdatePostAsync(postId, userId, dto);
        return result.ToActionResult(this);
    }



    // ✅ Endpoint tìm kiếm bài viết
    [HttpGet("search")]
    public async Task<IActionResult> SearchPosts([FromQuery] string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return Ok(new List<PostResponseDto>());

        var result = await _postService.SearchPostsAsync(keyword);
        return result.ToActionResult(this);
    }


}