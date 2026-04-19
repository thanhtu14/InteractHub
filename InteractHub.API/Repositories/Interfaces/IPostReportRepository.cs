using InteractHub.API.Entities;

namespace InteractHub.API.Repositories.Interfaces;

public interface IPostReportRepository : IRepository<PostReport>
{
    Task<bool> HasUserReportedPostAsync(string userId, int postId);
}