using InteractHub.API.DTOs.User;
using InteractHub.API.Entities;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace InteractHub.API.Services.Implementations;

public class UserService : IUserService
{
    private readonly UserManager<User> _userManager;

    public UserService(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    // ── GET BY ID ─────────────────────────────────────────────
    public async Task<UserDto?> GetByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return null;

        return MapToDto(user);
    }

    // ── GET MY PROFILE ────────────────────────────────────────
    public async Task<UserDto?> GetMyProfileAsync(string userId)
    {
        return await GetByIdAsync(userId);
    }

    // ── UPDATE PROFILE ────────────────────────────────────────
    public async Task<UserDto> UpdateProfileAsync(string userId, UpdateProfileDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new Exception("Người dùng không tồn tại.");

        // 1. Cập nhật thông tin cơ bản
        user.FullName    = dto.Username;
        user.PhoneNumber = dto.Phone;
        user.DateOfBirth = dto.DateOfBirth;
        user.Bio         = dto.Bio;
        user.Gender      = dto.Gender;

        if (!string.IsNullOrEmpty(dto.AvatarUrl)) user.ProfilePicture = dto.AvatarUrl;
        if (!string.IsNullOrEmpty(dto.CoverUrl))  user.CoverUrl       = dto.CoverUrl;

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            throw new Exception(string.Join(", ", updateResult.Errors.Select(e => e.Description)));

        // 2. Đổi mật khẩu — chỉ xử lý khi người dùng điền NewPassword
        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
                throw new Exception("Vui lòng nhập mật khẩu hiện tại.");

            if (dto.NewPassword != dto.ConfirmNewPassword)
                throw new Exception("Mật khẩu xác nhận không khớp.");

            // Identity tự kiểm tra password cũ và hash mật khẩu mới
            var passwordResult = await _userManager.ChangePasswordAsync(
                user, dto.CurrentPassword, dto.NewPassword);

            if (!passwordResult.Succeeded)
                throw new Exception(string.Join(", ", passwordResult.Errors.Select(e => e.Description)));
        }

        return MapToDto(user);
    }

    // ── UPDATE AVATAR ─────────────────────────────────────────
    public async Task UpdateAvatarAsync(string userId, string avatarUrl)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new Exception("Người dùng không tồn tại.");

        user.ProfilePicture = avatarUrl;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
    }

    // ── UPDATE COVER ──────────────────────────────────────────
    public async Task UpdateCoverAsync(string userId, string coverUrl)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new Exception("Người dùng không tồn tại.");

        user.CoverUrl = coverUrl;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
    }

    // ── MAPPER ────────────────────────────────────────────────
    private static UserDto MapToDto(User user) => new()
    {
        Id          = user.Id,
        Username    = user.FullName ?? user.UserName ?? "",
        Email       = user.Email   ?? "",
        Phone       = user.PhoneNumber,
        AvatarUrl   = user.ProfilePicture,
        CoverUrl    = user.CoverUrl,
        Bio         = user.Bio,
        DateOfBirth = user.DateOfBirth,
        Gender      = user.Gender,
        CreatedAt = user.CreatedAt,
        Roles       = new List<string> { "User" },
    };
}