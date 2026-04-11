
namespace InteractHub.API.DTOs.Friendships;

public class FriendRequestDto
{

    public required string RequesterId { get; set; }
    public required string ReceiverId { get; set; }

}
