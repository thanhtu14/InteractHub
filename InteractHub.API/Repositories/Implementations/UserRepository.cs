using InteractHub.API.Data;
using InteractHub.API.Entities;
using Microsoft.EntityFrameworkCore;
using InteractHub.API.Repositories.Interfaces;

namespace InteractHub.API.Repositories.Implementations;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    // Tìm user theo email
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _db.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    // Kiểm tra email đã tồn tại chưa
    public async Task<bool> ExistsByEmailAsync(string email)
    {
        return await _db.Users
            .AnyAsync(u => u.Email == email);
    }

    // Thêm user mới vào database
    public async Task<User> CreateAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }
    public async Task<User?> GetByIdAsync(string id)
{
    return await _db.Users
        .FirstOrDefaultAsync(u => u.Id == id);
}
}