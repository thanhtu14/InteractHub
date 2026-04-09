using InteractHub.API.Entities;

namespace InteractHub.API.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<bool> ExistsByEmailAsync(string email);
    Task<User> CreateAsync(User user);
     Task<User?> GetByIdAsync(string id);
}