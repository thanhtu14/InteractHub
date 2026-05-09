using InteractHub.API.DTOs.Hashtag;
using InteractHub.API.DTOs.Posts;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Implementations;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Moq;
using Xunit;

namespace InteractHub.Test.Services;

public class PostServiceTests
{
    private readonly Mock<IPostRepository> _postRepoMock;
    private readonly Mock<IMediaService> _mediaServiceMock;
    private readonly Mock<IHashtagService> _hashtagServiceMock;
    private readonly Mock<IPostHashtagRepository> _postHashtagRepoMock;
    private readonly Mock<IFriendshipRepository> _friendshipRepoMock;
    private readonly Mock<INotificationService> _notificationServiceMock;

    private readonly PostService _service;

    public PostServiceTests()
    {
        _postRepoMock = new Mock<IPostRepository>();
        _mediaServiceMock = new Mock<IMediaService>();
        _hashtagServiceMock = new Mock<IHashtagService>();
        _postHashtagRepoMock = new Mock<IPostHashtagRepository>();
        _friendshipRepoMock = new Mock<IFriendshipRepository>();
        _notificationServiceMock = new Mock<INotificationService>();

        _service = new PostService(
            _postRepoMock.Object,
            _mediaServiceMock.Object,
            _hashtagServiceMock.Object,
            _postHashtagRepoMock.Object,
            _notificationServiceMock.Object,
            _friendshipRepoMock.Object
        );
    }

    // =====================================================
    // CREATE POST
    // =====================================================

    [Fact]
    public async Task CreatePostAsync_ReturnSuccess()
    {
        var dto = new PostCreateDto
        {
            Title = "Test",
            Content = "Hello world"
        };

        var post = new Post
        {
            Id = 1,
            Title = dto.Title,
            Content = dto.Content,
            UserId = "user1",
            PostMedias = new List<PostMedia>()
        };

        _postRepoMock
            .Setup(r => r.AddAsync(It.IsAny<Post>()))
            .Callback<Post>(p => p.Id = 1)
            .Returns(Task.CompletedTask);

        _postRepoMock
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        _postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(post);

        var result = await _service.CreatePostAsync("user1", dto);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Equal("Test", result.Data!.Title);
    }

    [Fact]
    public async Task CreatePostAsync_WithImage_ReturnSuccess()
    {
        var fileMock = new Mock<IFormFile>();

        fileMock.Setup(f => f.ContentType)
            .Returns("image/png");

        fileMock.Setup(f => f.FileName)
            .Returns("test.png");

        var dto = new PostCreateDto
        {
            Content = "hello",
            Files = new List<IFormFile> { fileMock.Object }
        };

        _mediaServiceMock
            .Setup(x => x.SaveFileAsync(It.IsAny<IFormFile>(), "posts"))
            .ReturnsAsync("/uploads/test.png");

        _postRepoMock
            .Setup(x => x.AddAsync(It.IsAny<Post>()))
            .Callback<Post>(p => p.Id = 1)
            .Returns(Task.CompletedTask);

        _postRepoMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        _postRepoMock
            .Setup(x => x.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(new Post
            {
                Id = 1,
                UserId = "user1",
                PostMedias = new List<PostMedia>()
            });

        var result = await _service.CreatePostAsync("user1", dto);

        Assert.True(result.IsSuccess);

        _mediaServiceMock.Verify(
            x => x.SaveFileAsync(It.IsAny<IFormFile>(), "posts"),
            Times.Once);
    }

    [Fact]
    public async Task CreatePostAsync_WithHashtag_AddMappings()
    {
        var dto = new PostCreateDto
        {
            Content = "#hello"
        };

        _postRepoMock
            .Setup(x => x.AddAsync(It.IsAny<Post>()))
            .Callback<Post>(p => p.Id = 1)
            .Returns(Task.CompletedTask);

        _postRepoMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        _hashtagServiceMock
            .Setup(x => x.ExtractHashtagsAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<HashtagResponseDto>
            {
        new HashtagResponseDto
        {
            Id = 1,
            Tag = "test"
        }
            });

        _postRepoMock
            .Setup(x => x.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(new Post
            {
                Id = 1,
                UserId = "user1",
                PostMedias = new List<PostMedia>()
            });

        await _service.CreatePostAsync("user1", dto);

        _postHashtagRepoMock.Verify(
            x => x.AddRangeAsync(It.IsAny<List<Post_Hashtag>>()),
            Times.Once);
    }

    // =====================================================
    // GET POST BY ID
    // =====================================================

    [Fact]
    public async Task GetPostByIdAsync_ReturnPost_WhenExists()
    {
        var post = new Post
        {
            Id = 1,
            Content = "Post content",
            UserId = "user1"
        };

        _postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(post);

        var result = await _service.GetPostByIdAsync(1);

        Assert.True(result.IsSuccess);
        Assert.Equal("Post content", result.Data!.Content);
    }

    [Fact]
    public async Task GetPostByIdAsync_ReturnNotFound()
    {
        _postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(999))
            .ReturnsAsync((Post?)null);

        var result = await _service.GetPostByIdAsync(999);

        Assert.False(result.IsSuccess);
        Assert.Equal("Bài viết không tồn tại.", result.Error);
    }

    // =====================================================
    // UPDATE POST
    // =====================================================

    [Fact]
    public async Task UpdatePostAsync_ReturnSuccess()
    {
        var post = new Post
        {
            Id = 1,
            UserId = "user1",
            Title = "Old",
            Content = "Old content",
            PostMedias = new List<PostMedia>()
        };

        var dto = new PostUpdateDto
        {
            Title = "New",
            Content = "Updated content"
        };

        _postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(post);

        _postRepoMock
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        var result = await _service.UpdatePostAsync(1, "user1", dto);

        Assert.True(result.IsSuccess);
        Assert.Equal("New", post.Title);
    }

    [Fact]
    public async Task UpdatePostAsync_DeleteMedia_Success()
    {
        var post = new Post
        {
            Id = 1,
            UserId = "user1",
            PostMedias = new List<PostMedia>
            {
                new() { Url = "/a.jpg" }
            }
        };

        var dto = new PostUpdateDto
        {
            DeleteMediaUrls = new List<string> { "/a.jpg" }
        };

        _postRepoMock
            .Setup(x => x.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(post);

        _postRepoMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        var result = await _service.UpdatePostAsync(1, "user1", dto);

        Assert.True(result.IsSuccess);

        _mediaServiceMock.Verify(
            x => x.DeleteFile("/a.jpg"),
            Times.Once);
    }

    [Fact]
    public async Task UpdatePostAsync_AddNewMedia_Success()
    {
        var fileMock = new Mock<IFormFile>();

        fileMock.Setup(f => f.ContentType)
            .Returns("image/png");

        var post = new Post
        {
            Id = 1,
            UserId = "user1",
            PostMedias = new List<PostMedia>()
        };

        var dto = new PostUpdateDto
        {
            NewFiles = new List<IFormFile> { fileMock.Object }
        };

        _mediaServiceMock
            .Setup(x => x.SaveFileAsync(It.IsAny<IFormFile>(), "posts"))
            .ReturnsAsync("/uploads/new.png");

        _postRepoMock
            .Setup(x => x.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(post);

        _postRepoMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        var result = await _service.UpdatePostAsync(1, "user1", dto);

        Assert.True(result.IsSuccess);
        Assert.Single(post.PostMedias);
    }

    [Fact]
    public async Task UpdatePostAsync_ReturnBadRequest_WhenNotOwner()
    {
        var post = new Post
        {
            Id = 1,
            UserId = "other-user"
        };

        _postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(post);

        var result = await _service.UpdatePostAsync(
            1,
            "user1",
            new PostUpdateDto()
        );

        Assert.False(result.IsSuccess);
        Assert.Equal(
            "Bạn không có quyền chỉnh sửa bài viết này.",
            result.Error
        );
    }

    [Fact]
    public async Task UpdatePostAsync_ReturnNotFound_WhenPostNotExists()
    {
        _postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(99))
            .ReturnsAsync((Post?)null);

        var result = await _service.UpdatePostAsync(
            99,
            "user1",
            new PostUpdateDto());

        Assert.False(result.IsSuccess);
        Assert.Equal("Bài viết không tồn tại.", result.Error);
    }

    // =====================================================
    // DELETE POST
    // =====================================================

    [Fact]
    public async Task DeletePostAsync_ReturnSuccess()
    {
        var post = new Post
        {
            Id = 1,
            UserId = "user1",
            PostMedias = new List<PostMedia>()
        };

        _postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(post);

        _postRepoMock
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        var result = await _service.DeletePostAsync(1, "user1");

        Assert.True(result.IsSuccess);
        Assert.Equal("Xóa bài viết thành công.", result.Message);
    }

    [Fact]
    public async Task DeletePostAsync_DeleteMedia()
    {
        var post = new Post
        {
            Id = 1,
            UserId = "user1",
            PostMedias = new List<PostMedia>
            {
                new() { Url = "/a.jpg" }
            }
        };

        _postRepoMock
            .Setup(x => x.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(post);

        _postRepoMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        await _service.DeletePostAsync(1, "user1");

        _mediaServiceMock.Verify(
            x => x.DeleteFile("/a.jpg"),
            Times.Once);
    }

    [Fact]
    public async Task DeletePostAsync_ReturnNotFound_WhenPostNotExists()
    {
        _postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(99))
            .ReturnsAsync((Post?)null);

        var result = await _service.DeletePostAsync(99, "user1");

        Assert.False(result.IsSuccess);
        Assert.Equal("Bài viết không tồn tại.", result.Error);
    }

    [Fact]
    public async Task DeletePostAsync_ReturnBadRequest_WhenNotOwner()
    {
        var post = new Post
        {
            Id = 1,
            UserId = "other-user",
            PostMedias = new List<PostMedia>()
        };

        _postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(post);

        var result = await _service.DeletePostAsync(1, "user1");

        Assert.False(result.IsSuccess);
        Assert.Equal("Bạn không có quyền xóa bài viết này.", result.Error);
    }

    // =====================================================
    // TIMELINE
    // =====================================================

    [Fact]
    public async Task GetTimelineAsync_ReturnPosts()
    {
        var posts = new List<Post>
        {
            new()
            {
                Id = 1,
                Title = "Post 1",
                UserId = "user1",
                PostMedias = new List<PostMedia>()
            }
        };

        _postRepoMock
            .Setup(r => r.GetPostsWithDetailsAsync())
            .ReturnsAsync(posts);

        var result = await _service.GetTimelineAsync();

        Assert.True(result.IsSuccess);
        Assert.NotEmpty(result.Data!);
    }

    // =====================================================
    // USER POSTS
    // =====================================================

    [Fact]
    public async Task GetPostsByUserIdAsync_ReturnPosts()
    {
        var posts = new List<Post>
        {
            new()
            {
                Id = 1,
                UserId = "user1",
                PostMedias = new List<PostMedia>()
            }
        };

        _postRepoMock
            .Setup(r => r.GetPostsByUserIdAsync("user1"))
            .ReturnsAsync(posts);

        var result = await _service.GetPostsByUserIdAsync("user1");

        Assert.True(result.IsSuccess);
        Assert.NotEmpty(result.Data!);
    }

    // =====================================================
    // SHARE POST
    // =====================================================

    [Fact]
    public async Task SharePostAsync_ReturnBadRequest_WhenShareOwnPost()
    {
        var originalPost = new Post
        {
            Id = 1,
            UserId = "user1"
        };

        _postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(originalPost);

        var result = await _service.SharePostAsync(
            "user1",
            new SharePostRequest
            {
                OriginalPostId = 1
            });

        Assert.False(result.IsSuccess);

        Assert.Equal(
            "Bạn không thể chia sẻ bài viết của chính mình.",
            result.Error
        );
    }

    [Fact]
    public async Task SharePostAsync_ReturnNotFound_WhenPostNotExists()
    {
        _postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(99))
            .ReturnsAsync((Post?)null);

        var result = await _service.SharePostAsync(
            "user1",
            new SharePostRequest
            {
                OriginalPostId = 99
            });

        Assert.False(result.IsSuccess);

        Assert.Equal(
            "Bài viết gốc không tồn tại.",
            result.Error);
    }

    [Fact]
    public async Task SharePostAsync_ReturnSuccess()
    {
        var originalPost = new Post
        {
            Id = 1,
            UserId = "user2",
            PostMedias = new List<PostMedia>()
        };

        var sharedPost = new Post
        {
            Id = 2,
            UserId = "user1",
            PostMedias = new List<PostMedia>()
        };

        _postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(1))
            .ReturnsAsync(originalPost);

        _postRepoMock
            .Setup(r => r.AddAsync(It.IsAny<Post>()))
            .Callback<Post>(p => p.Id = 2)
            .Returns(Task.CompletedTask);

        _postRepoMock
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        _postRepoMock
            .Setup(r => r.GetPostDetailsByIdAsync(2))
            .ReturnsAsync(sharedPost);

        var result = await _service.SharePostAsync(
            "user1",
            new SharePostRequest
            {
                OriginalPostId = 1
            });

        Assert.True(result.IsSuccess);
        Assert.Equal("Chia sẻ bài viết thành công.", result.Message);
    }

    // =====================================================
    // SEARCH
    // =====================================================

    [Fact]
    public async Task SearchPostsAsync_ReturnEmpty_WhenKeywordEmpty()
    {
        var result = await _service.SearchPostsAsync("");

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Data!);
    }

    [Fact]
    public async Task SearchPostsAsync_ReturnPosts_WhenKeywordValid()
    {
        var posts = new List<Post>
        {
            new()
            {
                Id = 1,
                Title = "Hello",
                Content = "Hello world",
                UserId = "user1",
                PostMedias = new List<PostMedia>()
            }
        };

        _postRepoMock
            .Setup(r => r.SearchPostsAsync("Hello"))
            .ReturnsAsync(posts);

        var result = await _service.SearchPostsAsync("Hello");

        Assert.True(result.IsSuccess);
        Assert.NotEmpty(result.Data!);
    }

    // =====================================================
    // HOME FEED
    // =====================================================

    [Fact]
    public async Task GetHomeFeedAsync_ReturnPagedPosts()
    {
        var posts = new List<Post>
        {
            new()
            {
                Id = 1,
                UserId = "user2",
                PostMedias = new List<PostMedia>()
            }
        };

        _friendshipRepoMock
            .Setup(r => r.GetFriendIdsAsync("user1"))
            .ReturnsAsync(new List<string> { "user2" });

        _postRepoMock
            .Setup(r => r.GetHomeFeedPagedAsync(
                "user1",
                It.IsAny<List<string>>(),
                1,
                10))
            .ReturnsAsync((posts, 1));

        var result = await _service.GetHomeFeedAsync("user1");

        Assert.True(result.IsSuccess);
        Assert.NotEmpty(result.Data!.Posts);
        Assert.Equal(1, result.Data.TotalCount);
    }

    // =====================================================
    // ADMIN
    // =====================================================

    [Fact]
    public async Task UpdateStatusPostForAdminAsync_SendNotification_WhenHidden()
    {
        var post = new Post
        {
            Id = 1,
            UserId = "user1"
        };

        _postRepoMock
            .Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(post);

        _postRepoMock
            .Setup(x => x.UpdateStatusPostForAdminAsync(1, 0))
            .ReturnsAsync(true);

        var result = await _service.UpdateStatusPostForAdminAsync(1, 0);

        Assert.True(result.IsSuccess);

        _notificationServiceMock.Verify(
            x => x.CreateNotificationAsync(
                "user1",
                It.IsAny<string>(),
                "POST_HIDDEN",
                "/post/1"),
            Times.Once);
    }

    [Fact]
    public async Task UpdateStatusPostForAdminAsync_ReturnBadRequest_WhenStatusInvalid()
    {
        var result = await _service.UpdateStatusPostForAdminAsync(1, 999);

        Assert.False(result.IsSuccess);
        Assert.Equal("Trạng thái không hợp lệ.", result.Error);
    }

    [Fact]
    public async Task UpdateStatusPostForAdminAsync_ReturnNotFound()
    {
        _postRepoMock
            .Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync((Post?)null);

        var result = await _service.UpdateStatusPostForAdminAsync(1, 0);

        Assert.False(result.IsSuccess);
        Assert.Equal("Bài đăng không tồn tại.", result.Error);
    }
}