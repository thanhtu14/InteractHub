using System.Security.Claims;
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

    // ── 1. POST api/friendships/request ──────────────────────────
    [HttpPost("request/{receiverId}")]
    [Authorize]
    public async Task<IActionResult> SendFriendRequest(string receiverId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        if (currentUserId == receiverId)
            return BadRequest(new { message = "Bạn không thể gửi lời mời kết bạn cho chính mình." });

        try
        {
            var dto = new FriendRequestDto
            {
                RequesterId = currentUserId,
                ReceiverId = receiverId
            };

            var result = await _friendshipService.SendRequestAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── 2. GET api/friendships/pending-requests ──────────────────
    [HttpGet("pending-requests")]
    [Authorize]
    public async Task<IActionResult> GetPendingRequests()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Console.WriteLine("USER ID: " + userId);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        try
        {
            var requests = await _friendshipService.GetPendingRequestsAsync(userId);
            return Ok(requests);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── 3. PUT api/friendships/respond ────────────────────────────
    [HttpPut("respond")]
    [Authorize]
    public async Task<IActionResult> RespondToRequest([FromBody] FriendshipResponseDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        try
        {
            var result = await _friendshipService.RespondToRequestAsync(userId, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── 4. DELETE api/friendships/unfriend/{friendId} ─────────────
    [HttpDelete("unfriend/{friendId}")]
    [Authorize]
    public async Task<IActionResult> Unfriend(string friendId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        try
        {
            await _friendshipService.UnfriendAsync(userId, friendId);
            return Ok(new { message = "Đã xóa kết bạn thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpGet("status/{otherUserId}")]
    [Authorize]
    public async Task<IActionResult> GetStatus(string otherUserId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _friendshipService.GetFriendshipStatusAsync(userId, otherUserId);
        return Ok(result);
    }
    [HttpDelete("cancel/{receiverId}")]
    [Authorize]
    public async Task<IActionResult> CancelRequest(string receiverId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        try
        {
            await _friendshipService.CancelRequestAsync(userId, receiverId);
            return Ok(new { message = "Đã hủy lời mời." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    // ── 5. GET api/friendships/list/{userId} ──────────────────────
    [HttpGet("list/{userId}")]
    public async Task<IActionResult> GetFriendsList(string userId)
    {
        try
        {
            var friends = await _friendshipService.GetFriendsListAsync(userId);
            return Ok(friends);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpDelete("reject/{requesterId}")]
    [Authorize]
    public async Task<IActionResult> RejectRequest(string requesterId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        try
        {
            await _friendshipService.RejectRequestAsync(userId, requesterId);
            return Ok(new { message = "Đã từ chối lời mời." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}