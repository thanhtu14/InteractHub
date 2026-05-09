using InteractHub.API.DTOs.Story;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Implementations;
using Moq;

namespace InteractHub.Tests.Services;

public class StoryServiceTests
{
    private readonly Mock<IStoryRepository> _repoMock;
    private readonly StoryService _service;

    public StoryServiceTests()
    {
        _repoMock = new Mock<IStoryRepository>();
        _service = new StoryService(_repoMock.Object);
    }

    // =========================================================
    // GET ALL
    // =========================================================

    [Fact]
    public async Task GetAllAsync_ReturnStories()
    {
        // Arrange
        var stories = new List<Story>
        {
            new Story
            {
                Id = 1,
                Content = "Story 1",
                UserId = "user1"
            },
            new Story
            {
                Id = 2,
                Content = "Story 2",
                UserId = "user2"
            }
        };

        _repoMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(stories);

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Equal(2, result.Data.Count);
    }

    // =========================================================
    // GET BY ID SUCCESS
    // =========================================================

    [Fact]
    public async Task GetByIdAsync_ReturnStory_WhenExists()
    {
        // Arrange
        var story = new Story
        {
            Id = 1,
            Content = "Test story",
            UserId = "user1"
        };

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(story);

        // Act
        var result = await _service.GetByIdAsync(1);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Equal("Test story", result.Data.Content);

    }

    // =========================================================
    // GET BY ID NOT FOUND
    // =========================================================

    [Fact]
    public async Task GetByIdAsync_ReturnNotFound_WhenStoryNotExists()
    {
        // Arrange
        _repoMock
            .Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Story?)null);

        // Act
        var result = await _service.GetByIdAsync(999);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("Story không tồn tại.", result.Error);
    }

    // =========================================================
    // CREATE STORY SUCCESS
    // =========================================================

    [Fact]
    public async Task CreateAsync_CreateStorySuccessfully()
    {
        // Arrange
        var dto = new CreateStoryDTO
        {
            Content = "New Story",
            MediaUrl = "/images/story.jpg"
        };

        var story = new Story
        {
            Id = 1,
            Content = dto.Content,
            MediaUrl = dto.MediaUrl,
            UserId = "user1",
            CreatedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddHours(24)
        };

        _repoMock
            .Setup(r => r.CreateAsync(It.IsAny<Story>()))
            .ReturnsAsync(story);

        // Act
        var result = await _service.CreateAsync(dto, "user1");

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("Đăng tin thành công.", result.Message);
        Assert.NotNull(result.Data);
        Assert.Equal("New Story", result.Data.Content);
    }

    // =========================================================
    // UPDATE SUCCESS
    // =========================================================

    [Fact]
    public async Task UpdateAsync_ReturnSuccess_WhenStoryExists()
    {
        // Arrange
        var story = new Story
        {
            Id = 1,
            Content = "Old content",
            MediaUrl = "/old.jpg"
        };

        var dto = new UpdateStoryDTO
        {
            Content = "Updated content",
            MediaUrl = "/new.jpg"
        };

        _repoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(story);

        // Act
        var result = await _service.UpdateAsync(1, dto);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("Cập nhật tin thành công.", result.Message);

        Assert.Equal("Updated content", story.Content);
        Assert.Equal("/new.jpg", story.MediaUrl);
    }

    // =========================================================
    // UPDATE NOT FOUND
    // =========================================================

    [Fact]
    public async Task UpdateAsync_ReturnNotFound_WhenStoryNotExists()
    {
        // Arrange
        _repoMock
            .Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Story?)null);

        var dto = new UpdateStoryDTO
        {
            Content = "Updated"
        };

        // Act
        var result = await _service.UpdateAsync(999, dto);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("Story không tồn tại.", result.Error);
    }

    // =========================================================
    // DELETE SUCCESS
    // =========================================================

    [Fact]
    public async Task DeleteAsync_ReturnSuccess_WhenDeleteSuccess()
    {
        // Arrange
        _repoMock
            .Setup(r => r.DeleteAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _service.DeleteAsync(1);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("Đã xóa tin thành công.", result.Message);
    }

    // =========================================================
    // DELETE NOT FOUND
    // =========================================================

    [Fact]
    public async Task DeleteAsync_ReturnNotFound_WhenStoryNotExists()
    {
        // Arrange
        _repoMock
            .Setup(r => r.DeleteAsync(999))
            .ReturnsAsync(false);

        // Act
        var result = await _service.DeleteAsync(999);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("Story không tồn tại.", result.Error);
    }
}