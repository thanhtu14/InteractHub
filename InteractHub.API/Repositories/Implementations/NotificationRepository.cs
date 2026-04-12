using InteractHub.API.Data;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories.Implementations;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Notification>> GetByUserIdAsync(string userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<Notification?> GetByIdAsync(int id, string userId)
    {
        return await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
    }

    public async Task<int> CountUnreadAsync(string userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && (n.IsRead == false || n.IsRead == null));
    }

    public async Task AddAsync(Notification notification) => await _context.Notifications.AddAsync(notification);

    public void Update(Notification notification) => _context.Notifications.Update(notification);

    public void Delete(Notification notification) => _context.Notifications.Remove(notification);

    public async Task<bool> SaveChangesAsync() => await _context.SaveChangesAsync() > 0;
}