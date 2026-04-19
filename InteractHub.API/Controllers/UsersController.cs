using System.Security.Claims;
using InteractHub.API.Common.Extensions;
using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.User;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IMediaService _mediaService;

    public UsersController(IUserService userService, IMediaService mediaService)
    {
        _userService  = userService;
        _mediaService = mediaService;
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _userService.GetMyProfileAsync(userId);
        return result.ToActionResult(this);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var result = await _userService.GetByIdAsync(id);
        return result.ToActionResult(this);
    }

    [HttpPut("update")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _userService.UpdateProfileAsync(userId, dto);
        return result.ToActionResult(this);
    }

    [HttpPost("upload-avatar")]
    [Authorize]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var url = await _mediaService.SaveFileAsync(file, "avatars");
        if (url is null)
            return BadRequest(ApiResponse<object>.Fail("File không hợp lệ hoặc lỗi trong quá trình lưu."));

        var result = await _userService.UpdateAvatarAsync(userId, url);
        return result.ToActionResult(this);
    }

    [HttpPost("upload-cover")]
    [Authorize]
    public async Task<IActionResult> UploadCover(IFormFile file)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var url = await _mediaService.SaveFileAsync(file, "covers");
        if (url is null)
            return BadRequest(ApiResponse<object>.Fail("File không hợp lệ hoặc lỗi trong quá trình lưu."));

        var result = await _userService.UpdateCoverAsync(userId, url);
        return result.ToActionResult(this);
    }
}