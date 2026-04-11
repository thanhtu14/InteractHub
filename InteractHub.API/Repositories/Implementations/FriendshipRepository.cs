using InteractHub.API.Data;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using InteractHub.API.DTOs.Friendships;

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
    public async Task<Friendship?> GetFriendshipBothAsync(string userId1, string userId2)
    {
        return await _context.Friendships
            .FirstOrDefaultAsync(f =>
                (f.RequesterId == userId1 && f.ReceiverId == userId2) ||
                (f.RequesterId == userId2 && f.ReceiverId == userId1)
            );
    }
    public async Task<FriendshipStatusDto> GetFriendshipStatusAsync(string userId, string otherUserId)
    {
        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f =>
                (f.RequesterId == userId && f.ReceiverId == otherUserId) ||
                (f.RequesterId == otherUserId && f.ReceiverId == userId));

        if (friendship == null)
        {
            return new FriendshipStatusDto
            {
                status = null,
                isRequester = false
            };
        }

        return new FriendshipStatusDto
        {
            status = friendship.Status,
            isRequester = friendship.RequesterId == userId
        };
    }

    public async Task AddAsync(Friendship friendship) => await _context.Friendships.AddAsync(friendship);

    public void Delete(Friendship friendship) => _context.Friendships.Remove(friendship);

    public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    public void Update(Friendship friendship)
    {
        // Đánh dấu thực thể là Modified để EF tạo câu lệnh UPDATE thay vì INSERT
        _context.Friendships.Update(friendship);
    }
}