using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/hashtags")]
public class HashtagsController : ControllerBase
{
    private readonly IHashtagService _hashtagService;

    public HashtagsController(IHashtagService hashtagService)
    {
        _hashtagService = hashtagService;
    }

    // GET: api/hashtags
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _hashtagService.GetAllAsync();
        return Ok(result);
    }

    // GET: api/hashtags/search?tag=#abc
    [HttpGet("search")]
    public async Task<IActionResult> GetByTag([FromQuery] string tag)
    {
        var result = await _hashtagService.GetByTagAsync(tag);
        if (result == null) return NotFound();
        return Ok(result);
    }
}