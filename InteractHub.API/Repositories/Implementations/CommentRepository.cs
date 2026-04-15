using InteractHub.API.Data;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories.Implementations;

public class CommentRepository : Repository<Comment>, ICommentRepository
{
    public CommentRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Comment>> GetByPostIdAsync(int postId)
    {
        // 1. Lấy TẤT CẢ bình luận thuộc Post này (không phân biệt cha con)
        var allComments = await _context.Comments
        .Include(c => c.User)
        .Include(c => c.CommentLikes) // ✅ Đảm bảo nạp Like cho mọi level
        .Where(c => c.PostId == postId && c.Status == 1)
        .ToListAsync();

        // 2. Lọc ra các bình luận gốc (ParentId == null)
        var rootComments = allComments
            .Where(c => c.ParentId == null)
            .OrderByDescending(c => c.CreatedAt)
            .ToList();

        // 3. Với mỗi bình luận gốc, đi tìm TẤT CẢ các con, cháu, chắt của nó
        foreach (var root in rootComments)
        {
            root.Replies = GetFlatReplies(root.Id, allComments);
        }

        return rootComments;
    }

    // Hàm phụ trợ để gom tất cả con cháu về 1 danh sách phẳng
    private List<Comment> GetFlatReplies(int parentId, List<Comment> allComments)
    {
        var flatList = new List<Comment>();

        // Tìm các con trực tiếp
        var directChildren = allComments.Where(c => c.ParentId == parentId).ToList();

        foreach (var child in directChildren)
        {
            flatList.Add(child);
            // Đệ quy để lấy tiếp con của thằng này (cháu của root) và gộp vào list phẳng
            flatList.AddRange(GetFlatReplies(child.Id, allComments));
        }

        return flatList.OrderBy(c => c.CreatedAt).ToList();
    }

    public async Task<Comment?> GetByIdWithUserAsync(int commentId)
    {
        return await _dbSet
            .Include(c => c.User)
            .Include(c => c.CommentLikes)           // Quan trọng cho LikeCount
            .FirstOrDefaultAsync(c => c.Id == commentId && c.Status == 1);
    }

    // ====================== THÊM MỚI ======================
    public async Task<bool> PostExistsAsync(int postId)
    {
        return await _context.Posts.AnyAsync(p => p.Id == postId);
    }

    public async Task<bool> ParentCommentExistsAsync(int parentId)
    {
        return await _context.Comments
            .AnyAsync(c => c.Id == parentId && c.Status == 1);
    }

    // Các method like giữ nguyên
    public async Task<bool> CheckLikeExistsAsync(string userId, int commentId)
    {
        return await _context.CommentLikes
            .AnyAsync(l => l.CommentId == commentId && l.UserId == userId);
    }

    public async Task AddLikeAsync(string userId, int commentId)
    {
        var like = new CommentLike
        {
            CommentId = commentId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };
        await _context.CommentLikes.AddAsync(like);
    }

    public async Task RemoveLikeAsync(string userId, int commentId)
    {
        var like = await _context.CommentLikes
            .FirstOrDefaultAsync(l => l.CommentId == commentId && l.UserId == userId);

        if (like != null)
            _context.CommentLikes.Remove(like);
    }
}