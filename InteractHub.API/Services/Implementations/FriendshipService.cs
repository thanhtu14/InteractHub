using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Friendships;
using InteractHub.API.DTOs.User;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;

namespace InteractHub.API.Services.Implementations;

public class FriendshipService : IFriendshipService
{
    private readonly IFriendshipRepository _friendshipRepo;
    private readonly INotificationService _notificationService;

    public FriendshipService(IFriendshipRepository friendshipRepo, INotificationService notificationService)
    {
        _friendshipRepo = friendshipRepo;
        _notificationService = notificationService;
    }

    public async Task<Result<FriendshipResponseDto>> SendRequestAsync(FriendRequestDto dto)
    {
        var existing = await _friendshipRepo.GetFriendshipAsync(dto.RequesterId, dto.ReceiverId);
        if (existing != null)
            return Result<FriendshipResponseDto>.Conflict("Yêu cầu đã tồn tại hoặc hai bạn đã là bạn bè.");

        var friendship = new Friendship
        {
            RequesterId = dto.RequesterId,
            ReceiverId = dto.ReceiverId,
            Status = 0,
            CreatedAt = DateTime.UtcNow
        };

        await _friendshipRepo.AddAsync(friendship);
        await _friendshipRepo.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(
            dto.ReceiverId,
            "Bạn có một lời mời kết bạn mới.",
            "FRIEND_REQUEST",
            $"/profile/{dto.RequesterId}"
        );

        return Result<FriendshipResponseDto>.Ok(MapToDto(friendship), "Đã gửi lời mời kết bạn.");
    }

    public async Task<Result<IEnumerable<FriendshipResponseDto>>> GetPendingRequestsAsync(string userId)
    {
        var requests = await _friendshipRepo.GetPendingRequestsAsync(userId);
        return Result<IEnumerable<FriendshipResponseDto>>.Ok(requests.Select(MapToDto));
    }

    public async Task<Result<FriendshipResponseDto>> RespondToRequestAsync(string userId, FriendshipResponseDto dto)
    {
        var friendship = await _friendshipRepo.GetFriendshipAsync(dto.RequesterId, userId);
        if (friendship == null)
            return Result<FriendshipResponseDto>.NotFound("Không tìm thấy lời mời kết bạn.");

        if (dto.Status == 1)
        {
            friendship.Status = 1;
            friendship.UpdatedAt = DateTime.UtcNow;
            _friendshipRepo.Update(friendship);

            await _notificationService.CreateNotificationAsync(
                dto.RequesterId,
                "Đã chấp nhận lời mời kết bạn của bạn.",
                "FRIEND_ACCEPT",
                $"/profile/{userId}"
            );
        }
        else
        {
            _friendshipRepo.Delete(friendship);
        }

        await _friendshipRepo.SaveChangesAsync();
        return Result<FriendshipResponseDto>.Ok(MapToDto(friendship));
    }

    public async Task<Result<string>> UnfriendAsync(string userId, string friendId)
    {
        var friendship = await _friendshipRepo.GetFriendshipAsync(userId, friendId);
        if (friendship == null || friendship.Status != 1)
            return Result<string>.NotFound("Mối quan hệ bạn bè không tồn tại.");

        _friendshipRepo.Delete(friendship);
        await _friendshipRepo.SaveChangesAsync();
        return Result<string>.Ok(message: "Đã xóa kết bạn thành công.");
    }

    public async Task<Result<FriendshipStatusDto>> GetFriendshipStatusAsync(string userId, string otherUserId)
    {
        var friendship = await _friendshipRepo.GetFriendshipBothAsync(userId, otherUserId);

        return Result<FriendshipStatusDto>.Ok(new FriendshipStatusDto
        {
            status = friendship?.Status,
            isRequester = friendship?.RequesterId == userId
        });
    }

    public async Task<Result<string>> CancelRequestAsync(string userId, string receiverId)
    {
        var friendship = await _friendshipRepo.GetFriendshipAsync(userId, receiverId);
        if (friendship == null || friendship.Status != 0)
            return Result<string>.NotFound("Không tìm thấy lời mời để hủy.");

        _friendshipRepo.Delete(friendship);
        await _friendshipRepo.SaveChangesAsync();
        return Result<string>.Ok(message: "Đã hủy lời mời.");
    }

    public async Task<Result<IEnumerable<UserDto>>> GetFriendsListAsync(string userId)
    {
        var friendships = await _friendshipRepo.GetFriendsAsync(userId);
        return Result<IEnumerable<UserDto>>.Ok(friendships.Select(f =>
        {
            var friendUser = f.RequesterId == userId ? f.Receiver : f.Requester;
            return new UserDto
            {
                Id = friendUser?.Id ?? "",
                Username = friendUser?.FullName ?? friendUser?.UserName ?? "",
                AvatarUrl = friendUser?.ProfilePicture ?? ""
            };
        }));
    }

    public async Task<Result<string>> RejectRequestAsync(string userId, string requesterId)
    {
        var friendship = await _friendshipRepo.GetFriendshipAsync(requesterId, userId);
        if (friendship == null || friendship.Status != 0 || friendship.ReceiverId != userId)
            return Result<string>.NotFound("Không tìm thấy lời mời để từ chối.");

        _friendshipRepo.Delete(friendship);
        await _friendshipRepo.SaveChangesAsync();
        return Result<string>.Ok(message: "Đã từ chối lời mời.");
    }

    private static FriendshipResponseDto MapToDto(Friendship f) => new()
    {
        RequesterId = f.RequesterId ?? "",
        ReceiverId = f.ReceiverId ?? "",
        Status = f.Status,
        RequesterName = f.Requester?.FullName ?? "Unknown",
        AvatarUrl = f.Requester?.ProfilePicture ?? "",
        CreatedAt = f.CreatedAt
    };
}