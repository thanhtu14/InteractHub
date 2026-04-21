using InteractHub.API.Entities;
using InteractHub.API.DTOs.User;

namespace InteractHub.API.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<bool> ExistsByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<User?> GetByIdAsync(string id);
    Task<IEnumerable<UserSearchDto>> SearchUsersAsync(string keyword, string? currentUserId);}