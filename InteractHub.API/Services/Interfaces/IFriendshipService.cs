using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Friendships;
using InteractHub.API.DTOs.User;

namespace InteractHub.API.Services.Interfaces;

public interface IFriendshipService
{
    Task<Result<FriendshipResponseDto>> SendRequestAsync(FriendRequestDto dto);
    Task<Result<IEnumerable<FriendshipResponseDto>>> GetPendingRequestsAsync(string userId);
    Task<Result<FriendshipResponseDto>> RespondToRequestAsync(string userId, FriendshipResponseDto dto);
    Task<Result<string>> UnfriendAsync(string userId, string friendId);
    Task<Result<FriendshipStatusDto>> GetFriendshipStatusAsync(string userId, string otherUserId);
    Task<Result<string>> CancelRequestAsync(string userId, string receiverId);
    Task<Result<IEnumerable<UserDto>>> GetFriendsListAsync(string userId);
    Task<Result<string>> RejectRequestAsync(string userId, string requesterId);
}