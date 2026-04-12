using InteractHub.API.Data;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories.Implementations;

public class PostHashtagRepository : IPostHashtagRepository
{
    private readonly AppDbContext _context;

    public PostHashtagRepository(AppDbContext context)
    {
        _context = context;
    }

    // 1. Thêm 1 mapping
    public async Task AddAsync(Post_Hashtag entity)
    {
        await _context.PostHashtags.AddAsync(entity);
    }

    // 2. Thêm nhiều (tối ưu hơn)
    public async Task AddRangeAsync(IEnumerable<Post_Hashtag> entities)
    {
        await _context.PostHashtags.AddRangeAsync(entities);
    }

    // 3. Lấy hashtag theo PostId (có Include 🔥)
    public async Task<IEnumerable<Post_Hashtag>> GetByPostIdAsync(int postId)
    {
        return await _context.PostHashtags
            .Include(ph => ph.Hashtag)
            .Where(ph => ph.PostId == postId)
            .ToListAsync();
    }

    // 4. Xóa toàn bộ hashtag của 1 post (dùng khi update)
    public async Task DeleteByPostIdAsync(int postId)
    {
        var list = await _context.PostHashtags
            .Where(ph => ph.PostId == postId)
            .ToListAsync();

        _context.PostHashtags.RemoveRange(list);
    }

    // 5. Save
    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}