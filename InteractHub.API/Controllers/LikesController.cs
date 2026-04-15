using InteractHub.API.DTOs.Likes;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using InteractHub.API.Common.Responses;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InteractHub.API.Controllers;
[ApiController]
[Route("api/likes")]
[Authorize]
public class LikesController : ControllerBase
{
    private readonly ILikeService _service;
    public LikesController(ILikeService service) => _service = service;

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost("react")]
    public async Task<IActionResult> React([FromBody] LikeRequestDTO request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _service.ReactAsync(userId, request);
        return result == null 
            ? Ok(ApiResponse<object>.Ok(null, "Unliked")) 
            : Ok(ApiResponse<LikeResponseDTO>.Ok(result, "Reacted"));
    }

    [HttpGet("state/{postId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetState(int postId)
    {
        var result = await _service.GetLikeStateAsync(GetUserId(), postId);
        return Ok(ApiResponse<LikeStateDTO>.Ok(result));
    }

    [HttpGet("details/{postId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDetails(int postId, [FromQuery] string? type)
    {
        var result = await _service.GetPostLikesDetailAsync(postId, type);
        return Ok(ApiResponse<IEnumerable<LikeResponseDTO>>.Ok(result));
    }
}