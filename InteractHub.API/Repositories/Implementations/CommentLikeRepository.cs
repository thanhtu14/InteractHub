// Repositories/Implementations/CommentLikeRepository.cs
using InteractHub.API.Data;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories.Implementations;

public class CommentLikeRepository : Repository<CommentLike>, ICommentLikeRepository
{
    // ✅ Không cần khai báo lại _context, _dbSet — đã có từ Repository<T>
    public CommentLikeRepository(AppDbContext context) : base(context) { }

    public async Task<bool> ExistsAsync(string userId, int commentId)
        => await _dbSet.AnyAsync(l => l.UserId == userId && l.CommentId == commentId);

    public async Task<CommentLike?> GetByUserAndCommentAsync(string userId, int commentId)
        => await _dbSet.FirstOrDefaultAsync(l => l.UserId == userId && l.CommentId == commentId);
}