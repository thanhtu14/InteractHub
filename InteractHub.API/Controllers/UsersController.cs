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
    private readonly IWebHostEnvironment _env;

    public UsersController(IUserService userService, IWebHostEnvironment env)
    {
        _userService = userService;
        _env = env;
    }

    // ── 1. GET api/users/me ──────────────────────────────────────
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _userService.GetMyProfileAsync(userId);
        if (user == null) return NotFound();

        return Ok(user);
    }

    // ── 2. GET api/users/{id} ────────────────────────────────────
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null) return NotFound();

        return Ok(user);
    }

    // ── 3. PUT api/users/update ──────────────────────────────────
    [HttpPut("update")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
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

    // ── 4. POST api/users/upload-avatar ──────────────────────────
    [HttpPost("upload-avatar")]
    [Authorize]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (file == null)
            return BadRequest(new { message = "Không tìm thấy file" });

        var url = await SaveImageAsync(file, "avatars");
        if (url is null)
            return BadRequest(new { message = "File không hợp lệ hoặc quá lớn (tối đa 5MB)." });

        await _userService.UpdateAvatarAsync(userId, url);
        return Ok(new { url });
    }

    // ── 5. POST api/users/upload-cover ───────────────────────────
    [HttpPost("upload-cover")]
    [Authorize]
    public async Task<IActionResult> UploadCover(IFormFile file)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        try
        {
            var url = await SaveImageAsync(file, "covers");
            if (url is null)
                return BadRequest(new { message = "File không hợp lệ hoặc quá lớn (tối đa 5MB)." });

            await _userService.UpdateCoverAsync(userId, url);
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── Helper: lưu file vào wwwroot/images/{folder}/ ────────────
    private async Task<string?> SaveImageAsync(IFormFile? file, string folder)
    {
        if (file is null || file.Length == 0) return null;

        if (file.Length > 5 * 1024 * 1024) return null;

        var allowed = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowed.Contains(file.ContentType.ToLower())) return null;

        var uploadDir = Path.Combine(_env.WebRootPath, "images", folder);
        Directory.CreateDirectory(uploadDir);

        var ext = Path.GetExtension(file.FileName).ToLower();
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadDir, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/images/{folder}/{fileName}";
    }
    
}