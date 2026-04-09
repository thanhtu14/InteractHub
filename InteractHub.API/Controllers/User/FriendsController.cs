using System.Security.Claims;
using InteractHub.API.DTOs.User;
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
    [HttpPost("request")]
    [Authorize]
    public async Task<IActionResult> SendFriendRequest([FromBody] FriendRequestDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        if (currentUserId == dto.ReceiverId)
            return BadRequest(new { message = "Bạn không thể gửi lời mời kết bạn cho chính mình." });

        try
        {
            // Gán RequesterId là người dùng hiện tại để đảm bảo tính bảo mật
            dto.RequesterId = currentUserId;
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
}