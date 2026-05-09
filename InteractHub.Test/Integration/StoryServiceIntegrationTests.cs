using FluentAssertions;
using InteractHub.API.Data;
using InteractHub.API.DTOs.Story;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Implementations;
using InteractHub.API.Services.Implementations;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Tests.Integration.Services;

public class StoryServiceIntegrationTests
{
    private readonly AppDbContext _context;
    private readonly StoryService _service;

    public StoryServiceIntegrationTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);

        var repository = new StoryRepository(_context);

        _service = new StoryService(repository);
    }

    // =========================================================
    // CREATE STORY
    // =========================================================

    [Fact]
    public async Task CreateAsync_Should_Save_Story_To_Database()
    {
        // Arrange
        var dto = new CreateStoryDTO
        {
            Content = "Story integration test",
            MediaUrl = "/images/test.jpg"
        };

        var userId = "user-123";

        // Act
        var result = await _service.CreateAsync(dto, userId);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var storyInDb = await _context.Stories.FirstOrDefaultAsync();

        storyInDb.Should().NotBeNull();

        storyInDb!.Content.Should().Be(dto.Content);
        storyInDb.MediaUrl.Should().Be(dto.MediaUrl);
        storyInDb.UserId.Should().Be(userId);
        storyInDb.CreatedAt.Should().NotBeNull();
        storyInDb.ExpiredAt.Should().NotBeNull();
        storyInDb!.ExpiredAt!.Value.Should().BeAfter(storyInDb.CreatedAt!.Value);

    }

    // =========================================================
    // GET ALL STORIES
    // =========================================================

    [Fact]
    public async Task GetAllAsync_Should_Return_All_Stories()
    {
        // Arrange
        _context.Stories.AddRange(
            new Story
            {
                Content = "Story 1",
                UserId = "u1",
                CreatedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddHours(24)
            },
            new Story
            {
                Content = "Story 2",
                UserId = "u2",
                CreatedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddHours(24)
            }
        );

        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.IsSuccess.Should().BeTrue();

        result.Data.Should().HaveCount(2);
    }

    // =========================================================
    // GET STORY BY ID
    // =========================================================

    [Fact]
    public async Task GetByIdAsync_Should_Return_Story_When_Exists()
    {
        // Arrange
        var story = new Story
        {
            Content = "Find me",
            UserId = "u1",
            CreatedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddHours(24)
        };

        _context.Stories.Add(story);

        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetByIdAsync(story.Id);

        // Assert
        result.IsSuccess.Should().BeTrue();

        result.Data.Should().NotBeNull();

        result.Data!.Content.Should().Be("Find me");
    }

    [Fact]
    public async Task GetByIdAsync_Should_Return_NotFound_When_Not_Exists()
    {
        // Act
        var result = await _service.GetByIdAsync(999);

        // Assert
        result.IsSuccess.Should().BeFalse();

        result.Message.Should().Be("Story không tồn tại.");
    }

    // =========================================================
    // UPDATE STORY
    // =========================================================

    [Fact]
    public async Task UpdateAsync_Should_Update_Story()
    {
        // Arrange
        var story = new Story
        {
            Content = "Old content",
            MediaUrl = "/old.jpg",
            UserId = "u1",
            CreatedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddHours(24)
        };

        _context.Stories.Add(story);

        await _context.SaveChangesAsync();

        var dto = new UpdateStoryDTO
        {
            Content = "New content",
            MediaUrl = "/new.jpg"
        };

        // Act
        var result = await _service.UpdateAsync(story.Id, dto);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedStory = await _context.Stories.FindAsync(story.Id);

        updatedStory!.Content.Should().Be("New content");
        updatedStory.MediaUrl.Should().Be("/new.jpg");
    }

    [Fact]
    public async Task UpdateAsync_Should_Return_NotFound_When_Story_Not_Exists()
    {
        // Arrange
        var dto = new UpdateStoryDTO
        {
            Content = "Updated"
        };

        // Act
        var result = await _service.UpdateAsync(999, dto);

        // Assert
        result.IsSuccess.Should().BeFalse();

        result.Message.Should().Be("Story không tồn tại.");
    }

    // =========================================================
    // DELETE STORY
    // =========================================================

    [Fact]
    public async Task DeleteAsync_Should_Delete_Story()
    {
        // Arrange
        var story = new Story
        {
            Content = "Delete me",
            UserId = "u1",
            CreatedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddHours(24)
        };

        _context.Stories.Add(story);

        await _context.SaveChangesAsync();

        // Act
        var result = await _service.DeleteAsync(story.Id);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var deletedStory = await _context.Stories.FindAsync(story.Id);

        deletedStory.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_Should_Return_NotFound_When_Story_Not_Exists()
    {
        // Act
        var result = await _service.DeleteAsync(999);

        // Assert
        result.IsSuccess.Should().BeFalse();

        result.Message.Should().Be("Story không tồn tại.");
    }
}