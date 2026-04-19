using InteractHub.API.Common.Extensions;
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

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _hashtagService.GetAllAsync();
        return result.ToActionResult(this);
    }

    [HttpGet("search")]
    public async Task<IActionResult> GetByTag([FromQuery] string tag)
    {
        var result = await _hashtagService.GetByTagAsync(tag);
        return result.ToActionResult(this);
    }
}