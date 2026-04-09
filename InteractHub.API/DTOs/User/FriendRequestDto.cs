using System;

namespace InteractHub.API.DTOs.User;

public class FriendRequestDto
{

    public required string RequesterId { get; set; }
    public required string ReceiverId { get; set; }

}
