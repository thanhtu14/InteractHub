using InteractHub.API.Data;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories.Implementations;

public class StoryRepository : IStoryRepository
{
    private readonly AppDbContext _context;

    public StoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Story>> GetAllAsync()
        => await _context.Stories
            .Include(s => s.User)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

    public async Task<Story?> GetByIdAsync(int id)
        => await _context.Stories
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<List<Story>> GetByUserIdAsync(string userId)
        => await _context.Stories
            .Where(s => s.UserId == userId)
            .Include(s => s.User)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

    public async Task<Story> CreateAsync(Story story)
    {
        _context.Stories.Add(story);
        await _context.SaveChangesAsync();
        return story;
    }

    public async Task<bool> UpdateAsync(Story story)
    {
        _context.Stories.Update(story);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var story = await _context.Stories.FindAsync(id);
        if (story == null) return false;
        _context.Stories.Remove(story);
        return await _context.SaveChangesAsync() > 0;
    }
}