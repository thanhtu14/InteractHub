using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using InteractHub.API.Data;


namespace InteractHub.API.Repositories.Implementations;public class LikeRepository : ILikeRepository
{
    private readonly AppDbContext _context;

    public LikeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Like?> GetByUserAndPostAsync(string userId, int postId)
    => await _context.Likes
        .Include(l => l.Post) // Thêm dòng này để lấy thông tin bài viết (bao gồm cả Post.UserId)
        .FirstOrDefaultAsync(l => l.UserId == userId && l.PostId == postId);

    public async Task<List<Like>> GetByPostIdAsync(int postId)
    => await _context.Likes
        .Include(l => l.User)
        .Include(l => l.Post) // ← thêm dòng này
        .Where(l => l.PostId == postId)
        .ToListAsync();

    // Thực hiện GroupBy ngay dưới Database
    public async Task<Dictionary<string, int>> GetBreakdownByPostIdAsync(int postId)
{
    var data = await _context.Likes
        .Where(l => l.PostId == postId && l.Status == 1) // Chỉ lấy like active
        .GroupBy(l => l.Type)
        .Select(g => new 
        { 
            // Chuyển Enum sang string và viết thường để khớp với REACTIONS bên React
            Type = g.Key.ToString().ToLower(), 
            Count = g.Count() 
        })
        .ToListAsync();

    return data.ToDictionary(x => x.Type, x => x.Count);
}

    public async Task AddAsync(Like like) => await _context.Likes.AddAsync(like);

    public async Task DeleteAsync(Like like) 
    {
        _context.Likes.Remove(like);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
}