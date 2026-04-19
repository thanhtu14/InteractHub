using InteractHub.API.Common.Extensions;
using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Likes;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
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
        return result.ToActionResult(this);
    }

    [HttpGet("state/{postId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetState(int postId)
    {
        var result = await _service.GetLikeStateAsync(GetUserId(), postId);
        return result.ToActionResult(this);
    }

    [HttpGet("details/{postId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDetails(int postId, [FromQuery] string? type)
    {
        var result = await _service.GetPostLikesDetailAsync(postId, type);
        return result.ToActionResult(this);
    }
}