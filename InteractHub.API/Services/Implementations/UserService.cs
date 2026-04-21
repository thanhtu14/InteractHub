using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.User;
using InteractHub.API.Entities;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services.Implementations;

public class UserService : IUserService
{
    private readonly UserManager<User> _userManager;
    private readonly INotificationService _notificationService;

    public UserService(UserManager<User> userManager, INotificationService notificationService)
    {
        _userManager = userManager;
        _notificationService = notificationService;
    }

    public async Task<Result<UserDto>> GetByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        return user == null
            ? Result<UserDto>.NotFound("Người dùng không tồn tại.")
            : Result<UserDto>.Ok(MapToDto(user));
    }

    public async Task<Result<UserDto>> GetMyProfileAsync(string userId)
    {
        return await GetByIdAsync(userId);
    }

    public async Task<Result<UserDto>> UpdateProfileAsync(string userId, UpdateProfileDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return Result<UserDto>.NotFound("Người dùng không tồn tại.");

        user.FullName = dto.UserName;
        user.PhoneNumber = dto.Phone;
        user.DateOfBirth = dto.DateOfBirth;
        user.Bio = dto.Bio;
        user.Gender = dto.Gender;

        if (!string.IsNullOrEmpty(dto.AvatarUrl)) user.ProfilePicture = dto.AvatarUrl;
        if (!string.IsNullOrEmpty(dto.CoverUrl)) user.CoverUrl = dto.CoverUrl;

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Result<UserDto>.BadRequest(
                string.Join(", ", updateResult.Errors.Select(e => e.Description))
            );

        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
                return Result<UserDto>.BadRequest("Vui lòng nhập mật khẩu hiện tại.");

            if (dto.NewPassword != dto.ConfirmNewPassword)
                return Result<UserDto>.BadRequest("Mật khẩu xác nhận không khớp.");

            var passwordResult = await _userManager.ChangePasswordAsync(
                user, dto.CurrentPassword, dto.NewPassword);

            if (!passwordResult.Succeeded)
                return Result<UserDto>.BadRequest(
                    string.Join(", ", passwordResult.Errors.Select(e => e.Description))
                );

            await _notificationService.CreateNotificationAsync(
                userId,
                "Mật khẩu của bạn đã được thay đổi thành công.",
                "SECURITY",
                "/profile/settings"
            );
        }

        return Result<UserDto>.Ok(MapToDto(user), "Cập nhật thông tin thành công.");
    }

    public async Task<Result<string>> UpdateAvatarAsync(string userId, string avatarUrl)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return Result<string>.NotFound("Người dùng không tồn tại.");

        user.ProfilePicture = avatarUrl;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Result<string>.BadRequest(
                string.Join(", ", result.Errors.Select(e => e.Description))
            );

        return Result<string>.Ok(avatarUrl, "Cập nhật ảnh đại diện thành công.");
    }

    public async Task<Result<string>> UpdateCoverAsync(string userId, string coverUrl)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return Result<string>.NotFound("Người dùng không tồn tại.");

        user.CoverUrl = coverUrl;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Result<string>.BadRequest(
                string.Join(", ", result.Errors.Select(e => e.Description))
            );

        return Result<string>.Ok(coverUrl, "Cập nhật ảnh bìa thành công.");
    }

    private static UserDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Username = user.FullName ?? user.UserName ?? "",
        Email = user.Email ?? "",
        Phone = user.PhoneNumber,
        ProfilePicture = user.ProfilePicture,
        CoverUrl = user.CoverUrl,
        Bio = user.Bio,
        DateOfBirth = user.DateOfBirth,
        Gender = user.Gender,
        CreatedAt = user.CreatedAt,
        Roles = new List<string> { "User" },
    };









    // ✅ Tìm kiếm user theo FullName hoặc UserName, loại bỏ chính mình
public async Task<Result<IEnumerable<UserSearchDto>>> SearchUsersAsync(
    string keyword,
    string? currentUserId)
{
    if (string.IsNullOrWhiteSpace(keyword))
        return Result<IEnumerable<UserSearchDto>>.Ok(new List<UserSearchDto>());

    var lower = keyword.ToLower();

    var users = await _userManager.Users
        .Where(u =>
            u.Status == 1 &&
            (currentUserId == null || u.Id != currentUserId) &&

            (
                EF.Functions.Like(u.FullName, $"%{keyword}%") ||
                EF.Functions.Like(u.UserName, $"%{keyword}%")
            )
        )
        .Take(20)
        .ToListAsync();

    var result = users.Select(u => new UserSearchDto
    {
        Id = u.Id,
        Username = u.UserName ?? "",
        FullName = u.FullName,
        ProfilePicture = u.ProfilePicture,
        MutualFriends = 0,
        FriendshipStatus = "None"
    });

    return Result<IEnumerable<UserSearchDto>>.Ok(result);
}


}