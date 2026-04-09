using InteractHub.API.Data;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories.Implementations;

public class FriendshipRepository : IFriendshipRepository
{
    private readonly AppDbContext _context;

    public FriendshipRepository(AppDbContext context) => _context = context;

    public async Task<Friendship?> GetFriendshipAsync(string userId1, string userId2)
    {
        return await _context.Friendships
            .FirstOrDefaultAsync(f => 
                (f.RequesterId == userId1 && f.ReceiverId == userId2) ||
                (f.RequesterId == userId2 && f.ReceiverId == userId1));
    }

    public async Task<IEnumerable<Friendship>> GetPendingRequestsAsync(string userId)
    {
        return await _context.Friendships
            .Include(f => f.Requester)
            .Where(f => f.ReceiverId == userId && f.Status == 0) // 0 = Pending
            .ToListAsync();
    }

    public async Task<IEnumerable<Friendship>> GetFriendsAsync(string userId)
    {
        return await _context.Friendships
            .Include(f => f.Requester)
            .Include(f => f.Receiver)
            .Where(f => f.Status == 1 && (f.RequesterId == userId || f.ReceiverId == userId))
            .ToListAsync();
    }

    public async Task AddAsync(Friendship friendship) => await _context.Friendships.AddAsync(friendship);

    public void Delete(Friendship friendship) => _context.Friendships.Remove(friendship);

    public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
}