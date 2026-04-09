using InteractHub.API.DTOs.User;

namespace InteractHub.API.Services.Interfaces;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(string id);
    Task<UserDto?> GetMyProfileAsync(string userId);
    Task<UserDto>  UpdateProfileAsync(string userId, UpdateProfileDto dto);
    Task           UpdateAvatarAsync(string userId, string avatarUrl);
    Task           UpdateCoverAsync(string userId,  string coverUrl);
}