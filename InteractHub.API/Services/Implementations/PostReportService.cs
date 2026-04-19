using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Posts;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services.Implementations;

public class PostReportService : IPostReportService
{
    private readonly IPostReportRepository _reportRepo;
    private readonly IPostRepository _postRepo;

    public PostReportService(IPostReportRepository reportRepo, IPostRepository postRepo)
    {
        _reportRepo = reportRepo;
        _postRepo = postRepo;
    }

    public async Task<Result<string>> ReportPostAsync(string userId, PostReportRequestDTO request)
    {
        var post = await _postRepo.GetByIdAsync(request.PostId);
        if (post == null)
            return Result<string>.NotFound("Bài viết không tồn tại.");

        var exists = await _reportRepo.HasUserReportedPostAsync(userId, request.PostId);
        if (exists)
            return Result<string>.Conflict("Bạn đã báo cáo bài viết này rồi.");

        var report = new PostReport
        {
            PostId = request.PostId,
            UserId = userId,
            Reason = request.Reason,
            CreatedAt = DateTime.UtcNow,
            Status = 0
        };

        try
        {
            await _reportRepo.AddAsync(report);
            await _reportRepo.SaveChangesAsync();
            return Result<string>.Ok(message: "Cảm ơn bạn, báo cáo đã được gửi tới đội ngũ quản trị.");
        }
        catch (DbUpdateException)
        {
            return Result<string>.Conflict("Bạn đã báo cáo bài viết này rồi.");
        }
    }
}