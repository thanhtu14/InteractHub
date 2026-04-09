using InteractHub.API.DTOs.User;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;

namespace InteractHub.API.Services.Implementations;

public class FriendshipService : IFriendshipService
{
    private readonly IFriendshipRepository _friendshipRepo;

    public FriendshipService(IFriendshipRepository friendshipRepo)
    {
        _friendshipRepo = friendshipRepo;
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
        return MapToDto(friendship);
    }

    public async Task<IEnumerable<FriendshipResponseDto>> GetPendingRequestsAsync(string userId)
    {
        var requests = await _friendshipRepo.GetPendingRequestsAsync(userId);
        return requests.Select(MapToDto);
    }

    public async Task<FriendshipResponseDto> RespondToRequestAsync(string userId, FriendshipResponseDto dto)
    {
        // Phải tìm đúng bản ghi mà userId hiện tại là người nhận (Receiver)
        var friendship = await _friendshipRepo.GetFriendshipAsync(dto.RequesterId, userId);

        if (friendship == null || friendship.ReceiverId != userId)
            throw new Exception("Không tìm thấy lời mời kết bạn.");

        if (dto.Status == 1) // Accept
        {
            friendship.Status = 1;
        }
        else // Decline hoặc khác
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
                Id = friendUser!.Id,
                Username = friendUser.FullName ?? friendUser.UserName ?? "",
                AvatarUrl = friendUser.ProfilePicture
            };
        });
    }

    private static FriendshipResponseDto MapToDto(Friendship f) => new()
    {
        RequesterId = f.RequesterId,
        ReceiverId = f.ReceiverId,
        Status = f.Status,
        // Sử dụng toán tử điều kiện null (?) và giá trị mặc định (??)
        RequesterName = f.Requester?.FullName ?? "Unknown",
        AvatarUrl = f.Requester?.ProfilePicture ?? "",
        CreatedAt = f.CreatedAt
    };
}