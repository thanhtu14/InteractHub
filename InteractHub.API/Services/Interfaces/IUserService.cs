using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.User;

namespace InteractHub.API.Services.Interfaces;

public interface IUserService
{
    Task<Result<UserDto>> GetByIdAsync(string id);
    Task<Result<UserDto>> GetMyProfileAsync(string userId);
    Task<Result<UserDto>> UpdateProfileAsync(string userId, UpdateProfileDto dto);
    Task<Result<string>> UpdateAvatarAsync(string userId, string avatarUrl);
    Task<Result<string>> UpdateCoverAsync(string userId, string coverUrl);
}