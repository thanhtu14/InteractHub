using InteractHub.API.DTOs.Friendships;
using InteractHub.API.DTOs.User;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;

namespace InteractHub.API.Services.Implementations;

public class FriendshipService : IFriendshipService
{
    private readonly IFriendshipRepository _friendshipRepo;
    private readonly INotificationService _notificationService; // Thêm Service thông báo

    public FriendshipService(IFriendshipRepository friendshipRepo, INotificationService notificationService)
    {
        _friendshipRepo = friendshipRepo;
        _notificationService = notificationService;
    }

    public async Task<FriendshipResponseDto> SendRequestAsync(FriendRequestDto dto)
    {
        var existing = await _friendshipRepo.GetFriendshipAsync(dto.RequesterId, dto.ReceiverId);
        if (existing != null)
            throw new Exception("Yêu cầu đã tồn tại hoặc hai bạn đã là bạn bè.");

        var friendship = new Friendship
        {
            RequesterId = dto.RequesterId,
            ReceiverId = dto.ReceiverId,
            Status = 0,
            CreatedAt = DateTime.UtcNow
        };

        await _friendshipRepo.AddAsync(friendship);
        await _friendshipRepo.SaveChangesAsync();

        // --- TẠO THÔNG BÁO KHI GỬI LỜI MỜI ---
        await _notificationService.CreateNotificationAsync(
            dto.ReceiverId,
            "Bạn có một lời mời kết bạn mới.",
            "FRIEND_REQUEST",
            $"/profile/{dto.RequesterId}"
        );

        return MapToDto(friendship);
    }

    public async Task<IEnumerable<FriendshipResponseDto>> GetPendingRequestsAsync(string userId)
    {
        var requests = await _friendshipRepo.GetPendingRequestsAsync(userId);
        return requests.Select(MapToDto);
    }

    public async Task CancelRequestAsync(string userId, string receiverId)
    {
        var friendship = await _friendshipRepo.GetFriendshipAsync(userId, receiverId);

        if (friendship == null || friendship.Status != 0)
            throw new Exception("Không tìm thấy lời mời để hủy.");

        _friendshipRepo.Delete(friendship);
        await _friendshipRepo.SaveChangesAsync();
    }

    public async Task<FriendshipResponseDto> RespondToRequestAsync(string userId, FriendshipResponseDto dto)
    {
        // userId: Người đang login (Receiver)
        var friendship = await _friendshipRepo.GetFriendshipAsync(dto.RequesterId, userId);

        if (friendship == null)
            throw new Exception("Không tìm thấy lời mời kết bạn.");

        if (dto.Status == 1) // Chấp nhận
        {
            friendship.Status = 1;
            friendship.UpdatedAt = DateTime.UtcNow;
            _friendshipRepo.Update(friendship);

            // --- TẠO THÔNG BÁO KHI CHẤP NHẬN ---
            await _notificationService.CreateNotificationAsync(
                dto.RequesterId,
                "Đã chấp nhận lời mời kết bạn của bạn.",
                "FRIEND_ACCEPT",
                $"/profile/{userId}"
            );
        }
        else // Từ chối
        {
            _friendshipRepo.Delete(friendship);
        }

        await _friendshipRepo.SaveChangesAsync();
        return MapToDto(friendship);
    }

    public async Task UnfriendAsync(string userId, string friendId)
    {
        var friendship = await _friendshipRepo.GetFriendshipAsync(userId, friendId);
        if (friendship == null || friendship.Status != 1)
            throw new Exception("Mối quan hệ bạn bè không tồn tại.");

        _friendshipRepo.Delete(friendship);
        await _friendshipRepo.SaveChangesAsync();
    }

    public async Task<IEnumerable<UserDto>> GetFriendsListAsync(string userId)
    {
        var friendships = await _friendshipRepo.GetFriendsAsync(userId);
        return friendships.Select(f =>
        {
            var friendUser = f.RequesterId == userId ? f.Receiver : f.Requester;

            return new UserDto
            {
                Id = friendUser?.Id ?? "",
                Username = friendUser?.FullName ?? friendUser?.UserName ?? "",
                AvatarUrl = friendUser?.ProfilePicture ?? ""
            };
        });
    }

    public async Task<FriendshipStatusDto> GetFriendshipStatusAsync(string userId, string otherUserId)
    {
        var friendship = await _friendshipRepo.GetFriendshipBothAsync(userId, otherUserId);

        if (friendship == null)
        {
            return new FriendshipStatusDto
            {
                status = null,
                isRequester = false
            };
        }
        return new FriendshipStatusDto
        {
            status = friendship?.Status,
            isRequester = friendship?.RequesterId == userId
        };
    }

    public async Task RejectRequestAsync(string userId, string requesterId)
    {
        var friendship = await _friendshipRepo.GetFriendshipAsync(requesterId, userId);

        if (friendship == null || friendship.Status != 0 || friendship.ReceiverId != userId)
            throw new Exception("Không tìm thấy lời mời để từ chối.");

        _friendshipRepo.Delete(friendship);
        await _friendshipRepo.SaveChangesAsync();
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