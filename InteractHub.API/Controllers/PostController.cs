using System.Security.Claims;
using InteractHub.API.DTOs.Posts;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/post")] // Khớp với BASE_URL/api/post trong postService.ts của bạn
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;

    public PostsController(IPostService postService)
    {
        _postService = postService;
    }

    // ── 1. POST api/post/create ──────────────────────────────────
    [HttpPost("create")]
    [Authorize]
    // Sử [FromForm] để nhận FormData từ React (gồm Content, Title, Status và Files)
    public async Task<IActionResult> CreatePost([FromForm] PostCreateDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        try
        {
            var result = await _postService.CreatePostAsync(userId, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── 2. GET api/post/all (Lấy Timeline) ────────────────────────
    [HttpGet("all")]
    public async Task<IActionResult> GetTimeline()
    {
        try
        {
            var posts = await _postService.GetTimelineAsync();
            return Ok(posts);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── 3. GET api/post/user/{userId} ─────────────────────────────
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserPosts(string userId)
    {
        try
        {
            var posts = await _postService.GetPostsByUserIdAsync(userId);
            return Ok(posts);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── 4. GET api/post/{postId} ──────────────────────────────────
    [HttpGet("{postId}")]
    public async Task<IActionResult> GetPostById(int postId)
    {
        try
        {
            var post = await _postService.GetPostByIdAsync(postId);
            return Ok(post);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // ── 5. DELETE api/post/delete/{postId} ────────────────────────
    [HttpDelete("delete/{postId}")]
    [Authorize]
    public async Task<IActionResult> DeletePost(int postId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        try
        {
            await _postService.DeletePostAsync(postId, userId);
            return Ok(new { message = "Xóa bài viết thành công." });
        }
        catch (Exception ex)
        {
            // Trả về Forbid nếu lỗi là do không chính chủ, hoặc BadRequest cho các lỗi khác
            if (ex.Message.Contains("quyền")) 
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
                
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPut("update/{postId}")]
[Authorize]
public async Task<IActionResult> UpdatePost(int postId, [FromForm] PostUpdateDto dto)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId)) return Unauthorized();

    try
    {
        var result = await _postService.UpdatePostAsync(postId, userId, dto);
        return Ok(result);
    }
    catch (Exception ex)
    {
        if (ex.Message.Contains("quyền"))
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });

        return BadRequest(new { message = ex.Message });
    }
}
}