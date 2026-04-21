using System.Security.Claims;
using InteractHub.API.Common.Extensions;
using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Story;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/story")]
public class StoryController : ControllerBase
{
    private readonly IStoryService _service;

    public StoryController(IStoryService service)
    {
        _service = service;
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return result.ToActionResult(this);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result.ToActionResult(this);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromForm] CreateStoryDTO dto)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (dto.File != null)
        {
            var ext = Path.GetExtension(dto.File.FileName).ToLower();
            var isImage = new[] { ".jpg", ".jpeg", ".png", ".gif" }.Contains(ext);
            var isVideo = new[] { ".mp4", ".mov", ".avi" }.Contains(ext);

            if (!isImage && !isVideo)
                return BadRequest(ApiResponse<object>.Fail("Chỉ cho phép ảnh hoặc video."));

            var folder = Path.Combine(
                Directory.GetCurrentDirectory(),
                isImage ? "wwwroot/images/stories" : "wwwroot/videos/stories"
            );

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var fileName = Guid.NewGuid() + ext;
            var fullPath = Path.Combine(folder, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
                await dto.File.CopyToAsync(stream);

            dto.MediaUrl = isImage
                ? $"/images/stories/{fileName}"
                : $"/videos/stories/{fileName}";
        }

        var result = await _service.CreateAsync(dto, userId);
        return result.ToActionResult(this);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStoryDTO dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return result.ToActionResult(this);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        return result.ToActionResult(this);
    }
}