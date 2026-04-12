using InteractHub.API.Entities;

namespace InteractHub.API.Repositories.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetByUserIdAsync(string userId);
    Task<Notification?> GetByIdAsync(int id, string userId);
    Task<int> CountUnreadAsync(string userId);
    Task AddAsync(Notification notification);
    void Update(Notification notification);
    void Delete(Notification notification);
    Task<bool> SaveChangesAsync();
}