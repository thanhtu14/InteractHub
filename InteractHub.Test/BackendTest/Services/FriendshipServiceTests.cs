// InteractHub.Tests/Services/FriendshipServiceTests.cs
using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Friendships;
using InteractHub.API.DTOs.Messages;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Implementations;
using InteractHub.API.Services.Interfaces;
using Moq;
using Xunit;

namespace InteractHub.Tests.Services;

public class FriendshipServiceTests
{
    private readonly Mock<IFriendshipRepository> _mockRepo;
    private readonly Mock<INotificationService> _mockNotification;
    private readonly Mock<IMessageService> _mockMessaging;
    private readonly FriendshipService _service;

    public FriendshipServiceTests()
    {
        _mockRepo = new Mock<IFriendshipRepository>();
        _mockNotification = new Mock<INotificationService>();
        _mockMessaging = new Mock<IMessageService>();

        _service = new FriendshipService(
            _mockRepo.Object,
            _mockNotification.Object,
            _mockMessaging.Object
        );
    }

    // ─────────────────────────────────────────────
    // SendRequestAsync
    // ─────────────────────────────────────────────

    [Fact]
    public async Task SendRequest_WhenNotExist_ReturnsOk()
    {
        // Arrange
        var dto = new FriendRequestDto { RequesterId = "user1", ReceiverId = "user2" };

        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2"))
                 .ReturnsAsync((Friendship?)null);

        _mockRepo.Setup(r => r.AddAsync(It.IsAny<Friendship>()))
                 .Returns(Task.CompletedTask);

        _mockRepo.Setup(r => r.SaveChangesAsync())
                 .Returns(Task.CompletedTask);

        _mockNotification.Setup(n => n.CreateOrUpdateInteractionNotificationAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.SendRequestAsync(dto);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("user1", result.Data?.RequesterId);
        Assert.Equal("user2", result.Data?.ReceiverId);
        Assert.Equal(0, result.Data?.Status); // Pending
    }

    [Fact]
    public async Task SendRequest_WhenAlreadyExists_ReturnsConflict()
    {
        // Arrange
        var dto = new FriendRequestDto { RequesterId = "user1", ReceiverId = "user2" };

        var existing = new Friendship
        {
            RequesterId = "user1",
            ReceiverId = "user2",
            Status = 0
        };

        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2"))
                 .ReturnsAsync(existing);

        // Act
        var result = await _service.SendRequestAsync(dto);

        // Assert
        Assert.False(result.IsSuccess);
        _mockRepo.Verify(r => r.AddAsync(It.IsAny<Friendship>()), Times.Never);
    }

    [Fact]
    public async Task SendRequest_WhenSuccess_SendsNotification()
    {
        // Arrange
        var dto = new FriendRequestDto { RequesterId = "user1", ReceiverId = "user2" };

        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2"))
                 .ReturnsAsync((Friendship?)null);
        _mockRepo.Setup(r => r.AddAsync(It.IsAny<Friendship>())).Returns(Task.CompletedTask);
        _mockRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
        _mockNotification.Setup(n => n.CreateOrUpdateInteractionNotificationAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.SendRequestAsync(dto);

        // Assert: thông báo phải được gửi đến receiverId
        _mockNotification.Verify(n => n.CreateOrUpdateInteractionNotificationAsync(
            "user2",           // receiver
            "user1",           // requester
            "FRIEND_REQUEST",
            "/profile/user1",
            It.IsAny<string>(),
            1
        ), Times.Once);
    }

    // ─────────────────────────────────────────────
    // RespondToRequestAsync
    // ─────────────────────────────────────────────

    [Fact]
    public async Task RespondToRequest_WhenAccepted_UpdatesStatusTo1()
    {
        // Arrange
        var friendship = new Friendship
        {
            RequesterId = "user1",
            ReceiverId = "user2",
            Status = 0
        };

        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2"))
                 .ReturnsAsync(friendship);
        _mockRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
        _mockNotification.Setup(n => n.CreateOrUpdateInteractionNotificationAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
            .Returns(Task.CompletedTask);
        _mockMessaging.Setup(m => m.GetOrCreateConversationAsync("user1", "user2"))
            .ReturnsAsync(
                Result<ConversationResponseDto>.Ok(
                    new ConversationResponseDto()
                )
            );

        var dto = new FriendshipResponseDto
        {
            RequesterId = "user1",
            ReceiverId = "user2",
            Status = 1  // Accept
        };

        // Act
        var result = await _service.RespondToRequestAsync("user2", dto);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(1, friendship.Status);
    }

    [Fact]
    public async Task RespondToRequest_WhenAccepted_CreatesConversation()
    {
        // Arrange
        var friendship = new Friendship
        {
            RequesterId = "user1",
            ReceiverId = "user2",
            Status = 0
        };

        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2")).ReturnsAsync(friendship);
        _mockRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
        _mockNotification.Setup(n => n.CreateOrUpdateInteractionNotificationAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
            .Returns(Task.CompletedTask);
        _mockMessaging.Setup(m => m.GetOrCreateConversationAsync(
                It.IsAny<string>(),
                It.IsAny<string>()))
            .ReturnsAsync(
                Result<ConversationResponseDto>.Ok(
                    new ConversationResponseDto()
                )
            );

        var dto = new FriendshipResponseDto { RequesterId = "user1",ReceiverId = "user2", Status = 1 };

        // Act
        await _service.RespondToRequestAsync("user2", dto);

        // Assert: conversation phải được tạo
        _mockMessaging.Verify(m => m.GetOrCreateConversationAsync("user1", "user2"), Times.Once);
    }

    [Fact]
    public async Task RespondToRequest_WhenRejected_DeletesFriendship()
    {
        // Arrange
        var friendship = new Friendship
        {
            RequesterId = "user1",
            ReceiverId = "user2",
            Status = 0
        };

        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2")).ReturnsAsync(friendship);
        _mockRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

        var dto = new FriendshipResponseDto { RequesterId = "user1", ReceiverId = "user2", Status = 2 }; // Reject

        // Act
        var result = await _service.RespondToRequestAsync("user2", dto);

        // Assert: phải xóa, không update
        _mockRepo.Verify(r => r.Delete(friendship), Times.Once);
        _mockRepo.Verify(r => r.Update(It.IsAny<Friendship>()), Times.Never);
    }

    [Fact]
    public async Task RespondToRequest_WhenNotFound_ReturnsNotFound()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetFriendshipAsync(It.IsAny<string>(), It.IsAny<string>()))
                 .ReturnsAsync((Friendship?)null);

        var dto = new FriendshipResponseDto { RequesterId = "user1", ReceiverId = "user2", Status = 1 };

        // Act
        var result = await _service.RespondToRequestAsync("user2", dto);

        // Assert
        Assert.False(result.IsSuccess);
    }

    // ─────────────────────────────────────────────
    // UnfriendAsync
    // ─────────────────────────────────────────────

    [Fact]
    public async Task Unfriend_WhenFriends_DeletesAndReturnsOk()
    {
        // Arrange
        var friendship = new Friendship
        {
            RequesterId = "user1",
            ReceiverId = "user2",
            Status = 1
        };

        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2")).ReturnsAsync(friendship);
        _mockRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

        // Act
        var result = await _service.UnfriendAsync("user1", "user2");

        // Assert
        Assert.True(result.IsSuccess);
        _mockRepo.Verify(r => r.Delete(friendship), Times.Once);
    }

    [Fact]
    public async Task Unfriend_WhenNotFriends_ReturnsNotFound()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2"))
                 .ReturnsAsync((Friendship?)null);

        // Act
        var result = await _service.UnfriendAsync("user1", "user2");

        // Assert
        Assert.False(result.IsSuccess);
        _mockRepo.Verify(r => r.Delete(It.IsAny<Friendship>()), Times.Never);
    }

    [Fact]
    public async Task Unfriend_WhenStatusNotAccepted_ReturnsNotFound()
    {
        // Arrange
        var friendship = new Friendship
        {
            RequesterId = "user1",
            ReceiverId = "user2",
            Status = 0  // Vẫn đang pending, chưa kết bạn
        };

        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2")).ReturnsAsync(friendship);

        // Act
        var result = await _service.UnfriendAsync("user1", "user2");

        // Assert
        Assert.False(result.IsSuccess);
    }

    // ─────────────────────────────────────────────
    // CancelRequestAsync
    // ─────────────────────────────────────────────

    [Fact]
    public async Task CancelRequest_WhenPending_DeletesAndRemovesNotification()
    {
        // Arrange
        var friendship = new Friendship
        {
            RequesterId = "user1",
            ReceiverId = "user2",
            Status = 0
        };

        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2")).ReturnsAsync(friendship);
        _mockRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
        _mockNotification.Setup(n => n.DeleteNotificationByLogicAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.CancelRequestAsync("user1", "user2");

        // Assert
        Assert.True(result.IsSuccess);
        _mockRepo.Verify(r => r.Delete(friendship), Times.Once);
        _mockNotification.Verify(n => n.DeleteNotificationByLogicAsync(
            "user2", "FRIEND_REQUEST", "/profile/user1"), Times.Once);
    }

    [Fact]
    public async Task CancelRequest_WhenNotFound_ReturnsNotFound()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2"))
                 .ReturnsAsync((Friendship?)null);

        // Act
        var result = await _service.CancelRequestAsync("user1", "user2");

        // Assert
        Assert.False(result.IsSuccess);
    }

    [Fact]
    public async Task CancelRequest_WhenAlreadyAccepted_ReturnsNotFound()
    {
        // Arrange
        var friendship = new Friendship
        {
            RequesterId = "user1",
            ReceiverId = "user2",
            Status = 1  // Đã là bạn bè rồi, không thể hủy lời mời
        };

        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2")).ReturnsAsync(friendship);

        // Act
        var result = await _service.CancelRequestAsync("user1", "user2");

        // Assert
        Assert.False(result.IsSuccess);
        _mockRepo.Verify(r => r.Delete(It.IsAny<Friendship>()), Times.Never);
    }

    // ─────────────────────────────────────────────
    // RejectRequestAsync
    // ─────────────────────────────────────────────

    [Fact]
    public async Task RejectRequest_WhenValidReceiver_DeletesAndReturnsOk()
    {
        // Arrange
        var friendship = new Friendship
        {
            RequesterId = "user1",
            ReceiverId = "user2",
            Status = 0
        };

        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2")).ReturnsAsync(friendship);
        _mockRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

        // Act
        var result = await _service.RejectRequestAsync("user2", "user1");

        // Assert
        Assert.True(result.IsSuccess);
        _mockRepo.Verify(r => r.Delete(friendship), Times.Once);
    }

    [Fact]
    public async Task RejectRequest_WhenNotReceiver_ReturnsNotFound()
    {
        // Arrange
        var friendship = new Friendship
        {
            RequesterId = "user1",
            ReceiverId = "user3",  // user2 không phải receiver
            Status = 0
        };

        _mockRepo.Setup(r => r.GetFriendshipAsync("user1", "user2")).ReturnsAsync(friendship);

        // Act
        var result = await _service.RejectRequestAsync("user2", "user1");

        // Assert
        Assert.False(result.IsSuccess);
    }

    // ─────────────────────────────────────────────
    // GetFriendshipStatusAsync
    // ─────────────────────────────────────────────

    [Fact]
    public async Task GetFriendshipStatus_WhenRequester_ReturnsIsRequesterTrue()
    {
        // Arrange
        var friendship = new Friendship
        {
            RequesterId = "user1",
            ReceiverId = "user2",
            Status = 0
        };

        _mockRepo.Setup(r => r.GetFriendshipBothAsync("user1", "user2")).ReturnsAsync(friendship);

        // Act
        var result = await _service.GetFriendshipStatusAsync("user1", "user2");

        // Assert
        Assert.True(result.IsSuccess);
        Assert.True(result.Data?.isRequester);
        Assert.Equal(0, result.Data?.status);
    }

    [Fact]
    public async Task GetFriendshipStatus_WhenNoRelation_ReturnsNullStatus()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetFriendshipBothAsync("user1", "user2"))
                 .ReturnsAsync((Friendship?)null);

        // Act
        var result = await _service.GetFriendshipStatusAsync("user1", "user2");

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Null(result.Data?.status);
    }
}