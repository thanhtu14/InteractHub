using InteractHub.API.Data;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories.Implementations;

public class PostReportRepository : Repository<PostReport>, IPostReportRepository
{
    public PostReportRepository(AppDbContext context) : base(context) { }

    public async Task<bool> HasUserReportedPostAsync(string userId, int postId)
    {
        return await _dbSet.AnyAsync(r => r.UserId == userId && r.PostId == postId);
    }
}