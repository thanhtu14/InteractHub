using InteractHub.API.DTOs.Friendships;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Implementations;
using InteractHub.API.Services.Interfaces;
using Moq;
using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Messages;
namespace InteractHub.Test.Integration;

public class FriendshipServiceIntegrationTests
{
    private readonly Mock<IFriendshipRepository> _friendshipRepoMock;
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<IMessageService> _messagingServiceMock;
    private readonly FriendshipService _service;

    public FriendshipServiceIntegrationTests()
    {
        _friendshipRepoMock = new Mock<IFriendshipRepository>();
        _notificationServiceMock = new Mock<INotificationService>();
        _messagingServiceMock = new Mock<IMessageService>();

        _service = new FriendshipService(
            _friendshipRepoMock.Object,
            _notificationServiceMock.Object,
            _messagingServiceMock.Object
        );
    }

    // ─────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────

    private static Friendship FakeFriendship(
        string requesterId = "user1",
        string receiverId = "user2",
        int status = 0) => new()
        {
            RequesterId = requesterId,
            ReceiverId = receiverId,
            Status = status,
            CreatedAt = DateTime.UtcNow
        };

    // ─────────────────────────────────────────────
    // SEND REQUEST
    // ─────────────────────────────────────────────

    [Fact]
    public async Task SendRequestAsync_ReturnSuccess_WhenNoExistingFriendship()
    {
        var dto = new FriendRequestDto { RequesterId = "user1", ReceiverId = "user2" };

        _friendshipRepoMock
            .Setup(r => r.GetFriendshipAsync("user1", "user2"))
            .ReturnsAsync((Friendship?)null);

        // ✅ Đúng
        _friendshipRepoMock
            .Setup(r => r.SaveChangesAsync())
            .Returns(Task.CompletedTask);

        var result = await _service.SendRequestAsync(dto);

        Assert.True(result.IsSuccess);
        Assert.Equal("Đã gửi lời mời kết bạn.", result.Message);
        _friendshipRepoMock.Verify(r => r.AddAsync(It.IsAny<Friendship>()), Times.Once);
    }

    [Fact]
    public async Task SendRequestAsync_ReturnConflict_WhenAlreadyExists()
    {
        var dto = new FriendRequestDto { RequesterId = "user1", ReceiverId = "user2" };

        _friendshipRepoMock
            .Setup(r => r.GetFriendshipAsync("user1", "user2"))
            .ReturnsAsync(FakeFriendship());

        var result = await _service.SendRequestAsync(dto);

        Assert.False(result.IsSuccess);
        Assert.Equal("Yêu cầu đã tồn tại hoặc hai bạn đã là bạn bè.", result.Error);
        _friendshipRepoMock.Verify(r => r.AddAsync(It.IsAny<Friendship>()), Times.Never);
    }

    // ─────────────────────────────────────────────
    // RESPOND TO REQUEST
    // ─────────────────────────────────────────────

    [Fact]
    public async Task RespondToRequestAsync_ReturnSuccess_WhenAccept()
    {
        var friendship = FakeFriendship("user1", "user2", 0);
        var dto = new FriendshipResponseDto { RequesterId = "user1", ReceiverId = "user2", Status = 1 };

        _friendshipRepoMock
            .Setup(r => r.GetFriendshipAsync("user1", "user2"))
            .ReturnsAsync(friendship);

        _friendshipRepoMock
            .Setup(r => r.SaveChangesAsync())
            .Returns(Task.CompletedTask);

        // ✅ Đúng
        _messagingServiceMock
            .Setup(m => m.GetOrCreateConversationAsync("user1", "user2"))
            .ReturnsAsync(Result<ConversationResponseDto>.Ok(null));

        var result = await _service.RespondToRequestAsync("user2", dto);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, friendship.Status);
        _messagingServiceMock.Verify(m => m.GetOrCreateConversationAsync("user1", "user2"), Times.Once);
    }

    [Fact]
    public async Task RespondToRequestAsync_ReturnSuccess_WhenReject()
    {
        var friendship = FakeFriendship("user1", "user2", 0);
        var dto = new FriendshipResponseDto { RequesterId = "user1", ReceiverId = "user2", Status = 2 };

        _friendshipRepoMock
            .Setup(r => r.GetFriendshipAsync("user1", "user2"))
            .ReturnsAsync(friendship);

        _friendshipRepoMock
            .Setup(r => r.SaveChangesAsync())
            .Returns(Task.CompletedTask);

        var result = await _service.RespondToRequestAsync("user2", dto);

        Assert.True(result.IsSuccess);
        _friendshipRepoMock.Verify(r => r.Delete(friendship), Times.Once);
        _messagingServiceMock.Verify(m => m.GetOrCreateConversationAsync(
            It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task RespondToRequestAsync_ReturnNotFound_WhenFriendshipNotExists()
    {
        _friendshipRepoMock
            .Setup(r => r.GetFriendshipAsync("user1", "user2"))
            .ReturnsAsync((Friendship?)null);

        var dto = new FriendshipResponseDto { RequesterId = "user1", ReceiverId = "user2", Status = 1 };

        var result = await _service.RespondToRequestAsync("user2", dto);

        Assert.False(result.IsSuccess);
        Assert.Equal("Không tìm thấy lời mời kết bạn.", result.Error);
    }

    // ─────────────────────────────────────────────
    // UNFRIEND
    // ─────────────────────────────────────────────

    [Fact]
    public async Task UnfriendAsync_ReturnSuccess_WhenFriendshipExists()
    {
        var friendship = FakeFriendship("user1", "user2", 1);

        _friendshipRepoMock
            .Setup(r => r.GetFriendshipAsync("user1", "user2"))
            .ReturnsAsync(friendship);

        _friendshipRepoMock
            .Setup(r => r.SaveChangesAsync())
            .Returns(Task.CompletedTask);

        var result = await _service.UnfriendAsync("user1", "user2");

        Assert.True(result.IsSuccess);
        Assert.Equal("Đã xóa kết bạn thành công.", result.Message);
        _friendshipRepoMock.Verify(r => r.Delete(friendship), Times.Once);
    }

    [Fact]
    public async Task UnfriendAsync_ReturnNotFound_WhenFriendshipNotExists()
    {
        _friendshipRepoMock
            .Setup(r => r.GetFriendshipAsync("user1", "user2"))
            .ReturnsAsync((Friendship?)null);

        var result = await _service.UnfriendAsync("user1", "user2");

        Assert.False(result.IsSuccess);
        Assert.Equal("Mối quan hệ bạn bè không tồn tại.", result.Error);
    }

    [Fact]
    public async Task UnfriendAsync_ReturnNotFound_WhenStatusNotFriend()
    {
        var friendship = FakeFriendship("user1", "user2", 0); // status 0 = pending

        _friendshipRepoMock
            .Setup(r => r.GetFriendshipAsync("user1", "user2"))
            .ReturnsAsync(friendship);

        var result = await _service.UnfriendAsync("user1", "user2");

        Assert.False(result.IsSuccess);
        Assert.Equal("Mối quan hệ bạn bè không tồn tại.", result.Error);
    }

    // ─────────────────────────────────────────────
    // CANCEL REQUEST
    // ─────────────────────────────────────────────

    [Fact]
    public async Task CancelRequestAsync_ReturnSuccess_WhenRequestExists()
    {
        var friendship = FakeFriendship("user1", "user2", 0);

        _friendshipRepoMock
            .Setup(r => r.GetFriendshipAsync("user1", "user2"))
            .ReturnsAsync(friendship);

        _friendshipRepoMock
            .Setup(r => r.SaveChangesAsync())
            .Returns(Task.CompletedTask);

        var result = await _service.CancelRequestAsync("user1", "user2");

        Assert.True(result.IsSuccess);
        Assert.Equal("Đã hủy lời mời.", result.Message);
        _friendshipRepoMock.Verify(r => r.Delete(friendship), Times.Once);
    }

    [Fact]
    public async Task CancelRequestAsync_ReturnNotFound_WhenRequestNotExists()
    {
        _friendshipRepoMock
            .Setup(r => r.GetFriendshipAsync("user1", "user2"))
            .ReturnsAsync((Friendship?)null);

        var result = await _service.CancelRequestAsync("user1", "user2");

        Assert.False(result.IsSuccess);
        Assert.Equal("Không tìm thấy lời mời để hủy.", result.Error);
    }

    // ─────────────────────────────────────────────
    // REJECT REQUEST
    // ─────────────────────────────────────────────

    [Fact]
    public async Task RejectRequestAsync_ReturnSuccess_WhenRequestExists()
    {
        var friendship = FakeFriendship("user1", "user2", 0);

        _friendshipRepoMock
            .Setup(r => r.GetFriendshipAsync("user1", "user2"))
            .ReturnsAsync(friendship);

        _friendshipRepoMock
            .Setup(r => r.SaveChangesAsync())
            .Returns(Task.CompletedTask);

        var result = await _service.RejectRequestAsync("user2", "user1");

        Assert.True(result.IsSuccess);
        Assert.Equal("Đã từ chối lời mời.", result.Message);
        _friendshipRepoMock.Verify(r => r.Delete(friendship), Times.Once);
    }

    [Fact]
    public async Task RejectRequestAsync_ReturnNotFound_WhenRequestNotExists()
    {
        _friendshipRepoMock
            .Setup(r => r.GetFriendshipAsync("user1", "user2"))
            .ReturnsAsync((Friendship?)null);

        var result = await _service.RejectRequestAsync("user2", "user1");

        Assert.False(result.IsSuccess);
        Assert.Equal("Không tìm thấy lời mời để từ chối.", result.Error);
    }

    // ─────────────────────────────────────────────
    // GET FRIENDS LIST
    // ─────────────────────────────────────────────

    [Fact]
    public async Task GetFriendsListAsync_ReturnFriends_WhenExists()
    {
        var friendships = new List<Friendship>
        {
            new()
            {
                RequesterId = "user1",
                ReceiverId  = "user2",
                Status      = 1,
                Receiver    = new User { Id = "user2", FullName = "Nguyen Van B", ProfilePicture = "/images/b.png" }
            }
        };

        _friendshipRepoMock
            .Setup(r => r.GetFriendsAsync("user1"))
            .ReturnsAsync(friendships);

        var result = await _service.GetFriendsListAsync("user1");

        Assert.True(result.IsSuccess);
        Assert.NotEmpty(result.Data!);
        Assert.Equal("Nguyen Van B", result.Data!.First().Username);
    }

    [Fact]
    public async Task GetFriendsListAsync_ReturnEmpty_WhenNoFriends()
    {
        _friendshipRepoMock
            .Setup(r => r.GetFriendsAsync("user1"))
            .ReturnsAsync(new List<Friendship>());

        var result = await _service.GetFriendsListAsync("user1");

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Data!);
    }
}