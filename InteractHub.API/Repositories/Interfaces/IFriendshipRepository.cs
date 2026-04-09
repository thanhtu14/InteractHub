using InteractHub.API.Entities;

namespace InteractHub.API.Repositories.Interfaces;

public interface IFriendshipRepository
{
    Task<Friendship?> GetFriendshipAsync(string userId1, string userId2);
    Task<IEnumerable<Friendship>> GetPendingRequestsAsync(string userId);
    Task<IEnumerable<Friendship>> GetFriendsAsync(string userId);
    Task AddAsync(Friendship friendship);
    void Delete(Friendship friendship); // Xóa khỏi tracking, cần SaveChanges sau đó
    Task SaveChangesAsync();
}