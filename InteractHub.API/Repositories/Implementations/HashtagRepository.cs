using InteractHub.API.Data;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories.Implementations;

public class HashtagRepository : IHashtagRepository
{
    private readonly AppDbContext _context;

    public HashtagRepository(AppDbContext context)
    {
        _context = context;
    }

    // 1. Lấy tất cả hashtag
    public async Task<IEnumerable<Hashtag>> GetAllAsync()
    {
        return await _context.Hashtags
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();
    }

    // 2. Lấy theo Id
    public async Task<Hashtag?> GetByIdAsync(int id)
    {
        return await _context.Hashtags
            .FirstOrDefaultAsync(h => h.Id == id);
    }

    // 3. Lấy theo Tag (QUAN TRỌNG)
    public async Task<Hashtag?> GetByTagAsync(string tag)
    {
        tag = tag.ToLower();

        return await _context.Hashtags
            .FirstOrDefaultAsync(h => h.Tag!.ToLower() == tag);
    }

    // 4. Thêm mới
    public async Task AddAsync(Hashtag hashtag)
    {
        await _context.Hashtags.AddAsync(hashtag);
    }

    // 5. Update
    public void Update(Hashtag hashtag)
    {
        _context.Hashtags.Update(hashtag);
    }

    // 6. Delete
    public void Delete(Hashtag hashtag)
    {
        _context.Hashtags.Remove(hashtag);
    }

    // 7. SaveChanges
    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}