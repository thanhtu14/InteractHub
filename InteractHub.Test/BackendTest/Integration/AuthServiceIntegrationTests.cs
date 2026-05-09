// InteractHub.Tests/Integration/AuthServiceIntegrationTests.cs

using InteractHub.API.DTOs.Auth;
using InteractHub.API.Entities;
using InteractHub.API.Services.Implementations;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace InteractHub.Tests.Integration;

public class AuthServiceIntegrationTests
{
    private readonly Mock<UserManager<User>> _userManagerMock;
    private readonly Mock<SignInManager<User>> _signInManagerMock;
    private readonly IConfiguration _configuration;

    private readonly AuthService _service;

    public AuthServiceIntegrationTests()
    {
        // =====================================================
        // USER MANAGER MOCK
        // =====================================================

        var userStore = new Mock<IUserStore<User>>();

        _userManagerMock = new Mock<UserManager<User>>(
            userStore.Object,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!
        );

        // =====================================================
        // SIGNIN MANAGER MOCK
        // =====================================================

        var contextAccessor = new Mock<Microsoft.AspNetCore.Http.IHttpContextAccessor>();
        var claimsFactory = new Mock<IUserClaimsPrincipalFactory<User>>();

        _signInManagerMock = new Mock<SignInManager<User>>(
            _userManagerMock.Object,
            contextAccessor.Object,
            claimsFactory.Object,
            null!,
            null!,
            null!,
            null!
        );

        // =====================================================
        // CONFIG JWT
        // =====================================================

        var settings = new Dictionary<string, string?>
        {
            { "JwtSettings:SecretKey", "THIS_IS_SUPER_SECRET_KEY_123456789" },
            { "JwtSettings:Issuer", "InteractHub" },
            { "JwtSettings:Audience", "InteractHubUsers" },
            { "JwtSettings:ExpireHours", "24" }
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();

        // =====================================================
        // SERVICE
        // =====================================================

        _service = new AuthService(
            _userManagerMock.Object,
            _signInManagerMock.Object,
            _configuration
        );
    }

    // =====================================================
    // REGISTER SUCCESS
    // =====================================================

    [Fact]
    public async Task RegisterAsync_WhenValid_ReturnsSuccess()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FullName = "Test User",
            Email = "test@gmail.com",
            Password = "Password123!"
        };

        _userManagerMock
            .Setup(x => x.FindByEmailAsync(request.Email))
            .ReturnsAsync((User?)null);

        _userManagerMock
            .Setup(x => x.CreateAsync(It.IsAny<User>(), request.Password))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock
            .Setup(x => x.AddToRoleAsync(It.IsAny<User>(), "User"))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock
            .Setup(x => x.GetRolesAsync(It.IsAny<User>()))
            .ReturnsAsync(new List<string> { "User" });

        // Act
        var result = await _service.RegisterAsync(request);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.NotNull(result.Data.Token);
        Assert.Equal("test@gmail.com", result.Data.User.Email);
    }

    // =====================================================
    // REGISTER EMAIL EXISTS
    // =====================================================

    [Fact]
    public async Task RegisterAsync_WhenEmailExists_ReturnsConflict()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FullName = "Test User",
            Email = "exist@gmail.com",
            Password = "Password123!"
        };

        _userManagerMock
            .Setup(x => x.FindByEmailAsync(request.Email))
            .ReturnsAsync(new User());

        // Act
        var result = await _service.RegisterAsync(request);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("Email đã được sử dụng.", result.Error);
    }

    // =====================================================
    // LOGIN SUCCESS
    // =====================================================

    [Fact]
    public async Task LoginAsync_WhenCorrectPassword_ReturnsSuccess()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "user@gmail.com",
            Password = "Password123!"
        };

        var user = new User
        {
            Id = "1",
            Email = request.Email,
            FullName = "Test User",
            Status = 1
        };

        _userManagerMock
            .Setup(x => x.FindByEmailAsync(request.Email))
            .ReturnsAsync(user);

        _signInManagerMock
            .Setup(x => x.CheckPasswordSignInAsync(
                user,
                request.Password,
                false))
            .ReturnsAsync(SignInResult.Success);

        _userManagerMock
            .Setup(x => x.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "User" });

        // Act
        var result = await _service.LoginAsync(request);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.NotNull(result.Data.Token);
        Assert.Equal("user@gmail.com", result.Data.User.Email);
    }

    // =====================================================
    // LOGIN USER NOT FOUND
    // =====================================================

    [Fact]
    public async Task LoginAsync_WhenUserNotFound_ReturnsNotFound()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "unknown@gmail.com",
            Password = "123456"
        };

        _userManagerMock
            .Setup(x => x.FindByEmailAsync(request.Email))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _service.LoginAsync(request);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("Tài khoản không tồn tại.", result.Error);
    }

    // =====================================================
    // LOGIN WRONG PASSWORD
    // =====================================================

    [Fact]
    public async Task LoginAsync_WhenPasswordWrong_ReturnsBadRequest()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "user@gmail.com",
            Password = "wrongpassword"
        };

        var user = new User
        {
            Id = "1",
            Email = request.Email,
            FullName = "Test User",
            Status = 1
        };

        _userManagerMock
            .Setup(x => x.FindByEmailAsync(request.Email))
            .ReturnsAsync(user);

        _signInManagerMock
            .Setup(x => x.CheckPasswordSignInAsync(
                user,
                request.Password,
                false))
            .ReturnsAsync(SignInResult.Failed);

        // Act
        var result = await _service.LoginAsync(request);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("Mật khẩu không chính xác.", result.Error);
    }

    // =====================================================
    // LOGIN LOCKED USER
    // =====================================================

    [Fact]
    public async Task LoginAsync_WhenUserLocked_ReturnsBadRequest()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "locked@gmail.com",
            Password = "Password123!"
        };

        var user = new User
        {
            Id = "1",
            Email = request.Email,
            FullName = "Locked User",
            Status = 0 // locked
        };

        _userManagerMock
            .Setup(x => x.FindByEmailAsync(request.Email))
            .ReturnsAsync(user);

        _signInManagerMock
            .Setup(x => x.CheckPasswordSignInAsync(
                user,
                request.Password,
                false))
            .ReturnsAsync(SignInResult.Success);

        // Act
        var result = await _service.LoginAsync(request);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("Tài khoản đã bị khóa.", result.Error);
    }
}