using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Data;
using InteractHub.API.Entities;
using Microsoft.EntityFrameworkCore;
namespace InteractHub.API.Repositories.Implementations;


public class PostRepository : IPostRepository
{
    // Đổi ApplicationDbContext thành AppDbContext cho khớp với Program.cs
    private readonly AppDbContext _context;

    public PostRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Post post)
    {
        await _context.Posts.AddAsync(post);
    }

    public void Update(Post post)
    {
        _context.Posts.Update(post);
    }

    public void Delete(Post post)
    {
        _context.Posts.Remove(post);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<Post?> GetByIdAsync(int id)
    {
        return await _context.Posts.FindAsync(id);
    }

    public async Task<IEnumerable<Post>> GetPostsWithDetailsAsync()
    {
        return await _context.Posts
            .Include(p => p.User)
            .Include(p => p.PostMedias) // Đảm bảo trong Entity Post có property này
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Post>> GetPostsByUserIdAsync(string userId)
    {
        return await _context.Posts
            .Where(p => p.UserId == userId)
            .Include(p => p.User)
            .Include(p => p.PostMedias)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Post?> GetPostDetailsByIdAsync(int id)
    {
        return await _context.Posts
            .Include(p => p.User)
            .Include(p => p.PostMedias)
            // Nếu Entity chưa có Likes/Comments thì tạm thời comment lại để không lỗi build
            // .Include(p => p.Likes)
            // .Include(p => p.Comments)
            .FirstOrDefaultAsync(p => p.Id == id);
    }
    public async Task<(IEnumerable<Post> Posts, int TotalCount)> GetHomeFeedPagedAsync(
     string currentUserId,
     IEnumerable<string> friendIds,
     int page,
     int pageSize)
    {
        var friendIdSet = friendIds.ToHashSet();

        var query = _context.Posts
            .Include(p => p.User)
            .Include(p => p.PostMedias)
            .Where(p =>
                (p.Status == 1 && p.UserId != currentUserId) ||
                (p.Status == 2 && friendIdSet.Contains(p.UserId!))
            )
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();

        var posts = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (posts, totalCount);
    }
}