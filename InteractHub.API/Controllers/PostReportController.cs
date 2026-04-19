
using InteractHub.API.Common.Extensions;
using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Posts;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/post-reports")]
[Authorize]
public class PostReportsController : ControllerBase
{
    private readonly IPostReportService _reportService;

    public PostReportsController(IPostReportService reportService)
    {
        _reportService = reportService;
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost]
    public async Task<IActionResult> Report([FromBody] PostReportRequestDTO request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Reason))
            return BadRequest(ApiResponse<object>.Fail("Vui lòng cung cấp lý do báo cáo"));

        var result = await _reportService.ReportPostAsync(userId, request);
        return result.ToActionResult(this);
    }
}