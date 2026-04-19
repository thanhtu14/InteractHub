using System.Security.Claims;
using InteractHub.API.Common.Extensions;
using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Friendships;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/friendships")]
public class FriendshipsController : ControllerBase
{
    private readonly IFriendshipService _friendshipService;

    public FriendshipsController(IFriendshipService friendshipService)
    {
        _friendshipService = friendshipService;
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost("request/{receiverId}")]
    [Authorize]
    public async Task<IActionResult> SendFriendRequest(string receiverId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (userId == receiverId)
            return BadRequest(ApiResponse<object>.Fail("Bạn không thể gửi lời mời kết bạn cho chính mình."));

        var result = await _friendshipService.SendRequestAsync(new FriendRequestDto
        {
            RequesterId = userId,
            ReceiverId = receiverId
        });
        return result.ToActionResult(this);
    }

    [HttpGet("pending-requests")]
    [Authorize]
    public async Task<IActionResult> GetPendingRequests()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _friendshipService.GetPendingRequestsAsync(userId);
        return result.ToActionResult(this);
    }

    [HttpPut("respond")]
    [Authorize]
    public async Task<IActionResult> RespondToRequest([FromBody] FriendshipResponseDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _friendshipService.RespondToRequestAsync(userId, dto);
        return result.ToActionResult(this);
    }

    [HttpDelete("unfriend/{friendId}")]
    [Authorize]
    public async Task<IActionResult> Unfriend(string friendId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _friendshipService.UnfriendAsync(userId, friendId);
        return result.ToActionResult(this);
    }

    [HttpGet("status/{otherUserId}")]
    [Authorize]
    public async Task<IActionResult> GetStatus(string otherUserId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _friendshipService.GetFriendshipStatusAsync(userId, otherUserId);
        return result.ToActionResult(this);
    }

    [HttpDelete("cancel/{receiverId}")]
    [Authorize]
    public async Task<IActionResult> CancelRequest(string receiverId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _friendshipService.CancelRequestAsync(userId, receiverId);
        return result.ToActionResult(this);
    }

    [HttpGet("list/{userId}")]
    public async Task<IActionResult> GetFriendsList(string userId)
    {
        var result = await _friendshipService.GetFriendsListAsync(userId);
        return result.ToActionResult(this);
    }

    [HttpDelete("reject/{requesterId}")]
    [Authorize]
    public async Task<IActionResult> RejectRequest(string requesterId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _friendshipService.RejectRequestAsync(userId, requesterId);
        return result.ToActionResult(this);
    }
}