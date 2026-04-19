using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Posts;

namespace InteractHub.API.Services.Interfaces;

public interface IPostReportService
{
    Task<Result<string>> ReportPostAsync(string userId, PostReportRequestDTO request);
}