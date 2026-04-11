using InteractHub.API.Entities;
using InteractHub.API.DTOs.Friendships;

namespace InteractHub.API.Repositories.Interfaces;

public interface IFriendshipRepository
{
    Task<Friendship?> GetFriendshipAsync(string userId1, string userId2);
    Task<IEnumerable<Friendship>> GetPendingRequestsAsync(string userId);
    Task<IEnumerable<Friendship>> GetFriendsAsync(string userId);
    Task<FriendshipStatusDto> GetFriendshipStatusAsync(string userId, string otherUserId);
    Task<Friendship?> GetFriendshipBothAsync(string userId1, string userId2);
    Task AddAsync(Friendship friendship);
    void Delete(Friendship friendship); // Xóa khỏi tracking, cần SaveChanges sau đó
    Task SaveChangesAsync();
    void Update(Friendship friendship);
}