using InteractHub.API.Data;
using InteractHub.API.DTOs.User;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

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





public async Task<IEnumerable<UserSearchDto>> SearchUsersAsync(string keyword, string? currentUserId)
{
    var lower = keyword.ToLower();

    return await _db.Users
        .Where(u =>
            (currentUserId == null || u.Id != currentUserId) &&
            u.Status == 1 &&
            (
                (u.FullName != null && EF.Functions.Like(u.FullName.ToLower(), $"%{lower}%")) ||
                (u.UserName != null && EF.Functions.Like(u.UserName.ToLower(), $"%{lower}%"))
            )
        )
        .Select(u => new UserSearchDto
        {
            Id = u.Id,
            Username = u.UserName ?? "",
            FullName = u.FullName,
            ProfilePicture = u.ProfilePicture,
            MutualFriends = 0,
            FriendshipStatus = "None"
        })
        .Take(20)
        .ToListAsync();
}

}