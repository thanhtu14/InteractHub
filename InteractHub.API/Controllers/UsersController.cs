using System.Security.Claims;
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
    private readonly IMediaService _mediaService; // Sử dụng Service đã tách

    public UsersController(IUserService userService, IMediaService mediaService)
    {
        _userService = userService;
        _mediaService = mediaService;
    }

    // ── 1. Lấy thông tin cá nhân ──────────────────────────────────
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _userService.GetMyProfileAsync(userId);
        return user == null ? NotFound() : Ok(user);
    }

    // ── 2. Lấy thông tin user theo ID ────────────────────────────
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var user = await _userService.GetByIdAsync(id);
        return user == null ? NotFound() : Ok(user);
    }

    // ── 3. Cập nhật Profile (không bao gồm ảnh) ──────────────────
    [HttpPut("update")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        try
        {
            var result = await _userService.UpdateProfileAsync(userId, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── 4. Upload Avatar ──────────────────────────────────────────
    [HttpPost("upload-avatar")]
    [Authorize]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        // Gọi MediaService để xử lý file
        var url = await _mediaService.SaveFileAsync(file, "avatars");
        
        if (url is null)
            return BadRequest(new { message = "File không hợp lệ hoặc lỗi trong quá trình lưu." });

        await _userService.UpdateAvatarAsync(userId, url);
        return Ok(new { url });
    }

    // ── 5. Upload Ảnh bìa (Cover) ─────────────────────────────────
    [HttpPost("upload-cover")]
    [Authorize]
    public async Task<IActionResult> UploadCover(IFormFile file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var url = await _mediaService.SaveFileAsync(file, "covers");
        
        if (url is null)
            return BadRequest(new { message = "File không hợp lệ hoặc lỗi trong quá trình lưu." });

        await _userService.UpdateCoverAsync(userId, url);
        return Ok(new { url });
    }
}