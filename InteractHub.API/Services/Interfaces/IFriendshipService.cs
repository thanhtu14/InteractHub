using InteractHub.API.DTOs.User;

namespace InteractHub.API.Services.Interfaces;

public interface IFriendshipService
{
    // Gửi lời mời kết bạn
    Task<FriendshipResponseDto> SendRequestAsync(FriendRequestDto dto);

    // Lấy danh sách lời mời đang chờ (người khác gửi cho mình)
    Task<IEnumerable<FriendshipResponseDto>> GetPendingRequestsAsync(string userId);

    // Chấp nhận hoặc từ chối lời mời
    Task<FriendshipResponseDto> RespondToRequestAsync(string userId, FriendshipResponseDto dto);

    // Hủy kết bạn
    Task UnfriendAsync(string userId, string friendId);

    // Lấy danh sách bạn bè của một người dùng
    Task<IEnumerable<UserDto>> GetFriendsListAsync(string userId);
}