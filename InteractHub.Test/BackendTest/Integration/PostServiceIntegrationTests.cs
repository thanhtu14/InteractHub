using InteractHub.API.DTOs.Posts;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Implementations;
using InteractHub.API.Services.Interfaces;
using Moq;

namespace InteractHub.Test.Integration;

public class PostServiceIntegrationTests
{
    private readonly PostService _service;

    public PostServiceIntegrationTests()
    {
        var postRepoMock = new Mock<IPostRepository>();
        var mediaServiceMock = new Mock<IMediaService>();
        var hashtagServiceMock = new Mock<IHashtagService>();
        var postHashtagRepoMock = new Mock<IPostHashtagRepository>();
        var friendshipRepoMock = new Mock<IFriendshipRepository>();
        var notificationServiceMock = new Mock<INotificationService>();

        var posts = new List<Post>
        {
            new Post
            {
                Id = 1,
                UserId = "user1",
                Title = "Integration Test",
                Content = "Hello integration",
                CreatedAt = DateTime.UtcNow,
                PostMedias = new List<PostMedia>()
            }
        };

        postRepoMock
            .Setup(r => r.GetPostsWithDetailsAsync())
            .ReturnsAsync(posts);

        postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(posts[0]);

        postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(99))
            .ReturnsAsync((Post?)null);

        _service = new PostService(
            postRepoMock.Object,
            mediaServiceMock.Object,
            hashtagServiceMock.Object,
            postHashtagRepoMock.Object,
            notificationServiceMock.Object,
            friendshipRepoMock.Object
        );
    }

    // =====================================================
    // TIMELINE
    // =====================================================

    [Fact]
    public async Task GetTimelineAsync_ReturnPosts()
    {
        var result = await _service.GetTimelineAsync();

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);

        var list = result.Data!.ToList();
        Assert.NotEmpty(list);
        Assert.Equal("Integration Test", list[0].Title);
    }

    // =====================================================
    // GET POST BY ID - tìm thấy
    // =====================================================

    [Fact]
    public async Task GetPostByIdAsync_ReturnCorrectPost()
    {
        var result = await _service.GetPostByIdAsync(1);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Equal("Integration Test", result.Data!.Title);
        Assert.Equal("user1", result.Data.UserId);
    }

    // =====================================================
    // GET POST BY ID - không tìm thấy
    // =====================================================

    [Fact]
    public async Task GetPostByIdAsync_ReturnNotFound_WhenPostNotExists()
    {
        var result = await _service.GetPostByIdAsync(99);

        Assert.False(result.IsSuccess);
        Assert.Equal("Bài viết không tồn tại.", result.Error);
    }
}