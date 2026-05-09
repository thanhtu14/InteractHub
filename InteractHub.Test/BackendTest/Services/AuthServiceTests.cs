using Moq;
using Xunit;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using InteractHub.API.Services.Implementations;
using InteractHub.API.Entities;
using InteractHub.API.DTOs.Auth;

namespace InteractHub.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<UserManager<User>> _mockUserManager;
    private readonly Mock<SignInManager<User>> _mockSignInManager;
    private readonly IConfiguration _config;
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        var store = new Mock<IUserStore<User>>();
        _mockUserManager = new Mock<UserManager<User>>(
            store.Object, null, null, null, null, null, null, null, null);

        var contextAccessor = new Mock<Microsoft.AspNetCore.Http.IHttpContextAccessor>();
        var claimsFactory = new Mock<IUserClaimsPrincipalFactory<User>>();
        _mockSignInManager = new Mock<SignInManager<User>>(
            _mockUserManager.Object,
            contextAccessor.Object,
            claimsFactory.Object,
            null, null, null, null);

        var inMemorySettings = new Dictionary<string, string?>
        {
            ["JwtSettings:SecretKey"]   = "supersecretkey1234567890abcdef12",
            ["JwtSettings:Issuer"]      = "InteractHub",
            ["JwtSettings:Audience"]    = "InteractHubUsers",
            ["JwtSettings:ExpireHours"] = "24"
        };

        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _service = new AuthService(
            _mockUserManager.Object,
            _mockSignInManager.Object,
            _config
        );
    }

    // ─────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────

    private static User FakeUser(string id = "user-1", int status = 1) => new()
    {
        Id             = id,
        FullName       = "Nguyen Van A",
        Email          = "test@gmail.com",
        UserName       = "test@gmail.com",
        Status         = status,
        ProfilePicture = "/images/avatars/default-avatar.png"
    };

    private void SetupCreateUser(RegisterRequest request, IdentityResult createResult)
    {
        _mockUserManager
            .Setup(m => m.FindByEmailAsync(request.Email))
            .ReturnsAsync((User?)null);

        _mockUserManager
            .Setup(m => m.CreateAsync(It.IsAny<User>(), request.Password))
            .ReturnsAsync(createResult);
    }

    // ─────────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────────

    [Fact]
    public async Task Register_WhenEmailNotExist_ReturnsOkWithToken()
    {
        var request = new RegisterRequest { FullName = "Nguyen Van A", Email = "new@gmail.com", Password = "Password123!" };

        SetupCreateUser(request, IdentityResult.Success);
        _mockUserManager.Setup(m => m.AddToRoleAsync(It.IsAny<User>(), "User")).ReturnsAsync(IdentityResult.Success);
        _mockUserManager.Setup(m => m.GetRolesAsync(It.IsAny<User>())).ReturnsAsync(new List<string> { "User" });

        var result = await _service.RegisterAsync(request);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data?.Token);
        Assert.NotEmpty(result.Data!.Token);
        Assert.Equal("Đăng ký thành công.", result.Message);
    }

    [Fact]
    public async Task Register_WhenEmailAlreadyExists_ReturnsConflict()
    {
        var request = new RegisterRequest { Email = "existing@gmail.com", Password = "Password123!" };

        _mockUserManager.Setup(m => m.FindByEmailAsync(request.Email)).ReturnsAsync(FakeUser());

        var result = await _service.RegisterAsync(request);

        Assert.False(result.IsSuccess);
        Assert.Equal("Email đã được sử dụng.", result.Error);
        _mockUserManager.Verify(m => m.CreateAsync(It.IsAny<User>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Register_WhenPasswordTooWeak_ReturnsBadRequest()
    {
        var request = new RegisterRequest { Email = "new@gmail.com", Password = "123" };

        SetupCreateUser(request, IdentityResult.Failed(new IdentityError { Description = "Mật khẩu quá yếu." }));

        var result = await _service.RegisterAsync(request);

        Assert.False(result.IsSuccess);
        _mockUserManager.Verify(m => m.AddToRoleAsync(It.IsAny<User>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Register_WhenSuccess_AssignsUserRole()
    {
        var request = new RegisterRequest { Email = "new@gmail.com", Password = "Password123!" };

        SetupCreateUser(request, IdentityResult.Success);
        _mockUserManager.Setup(m => m.AddToRoleAsync(It.IsAny<User>(), "User")).ReturnsAsync(IdentityResult.Success);
        _mockUserManager.Setup(m => m.GetRolesAsync(It.IsAny<User>())).ReturnsAsync(new List<string> { "User" });

        await _service.RegisterAsync(request);

        _mockUserManager.Verify(m => m.AddToRoleAsync(It.IsAny<User>(), "User"), Times.Once);
        _mockUserManager.Verify(m => m.AddToRoleAsync(It.IsAny<User>(), "Admin"), Times.Never);
    }

    // ─────────────────────────────────────────────
    // REGISTER ADMIN
    // ─────────────────────────────────────────────

    [Fact]
    public async Task RegisterAdmin_WhenSuccess_AssignsAdminRole()
    {
        var request = new RegisterRequest { Email = "admin@gmail.com", Password = "Password123!" };

        SetupCreateUser(request, IdentityResult.Success);
        _mockUserManager.Setup(m => m.AddToRoleAsync(It.IsAny<User>(), "Admin")).ReturnsAsync(IdentityResult.Success);
        _mockUserManager.Setup(m => m.GetRolesAsync(It.IsAny<User>())).ReturnsAsync(new List<string> { "Admin" });

        var result = await _service.RegisterAdminAsync(request);

        Assert.True(result.IsSuccess);
        Assert.Contains("Admin", result.Data!.User.Roles);
        _mockUserManager.Verify(m => m.AddToRoleAsync(It.IsAny<User>(), "Admin"), Times.Once);
    }

    [Fact]
    public async Task RegisterAdmin_WhenEmailExists_ReturnsConflict()
    {
        _mockUserManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(FakeUser());

        var request = new RegisterRequest { Email = "existing@gmail.com", Password = "Password123!" };

        var result = await _service.RegisterAdminAsync(request);

        Assert.False(result.IsSuccess);
        Assert.Equal("Email đã được sử dụng.", result.Error);
    }

    // ─────────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────────

    [Fact]
    public async Task Login_WhenCorrectCredentials_ReturnsTokenAndUserInfo()
    {
        var user = FakeUser();
        var request = new LoginRequest { Email = "test@gmail.com", Password = "Password123!" };

        _mockUserManager.Setup(m => m.FindByEmailAsync(request.Email)).ReturnsAsync(user);
        _mockSignInManager.Setup(m => m.CheckPasswordSignInAsync(user, request.Password, false))
                          .ReturnsAsync(SignInResult.Success);
        _mockUserManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { "User" });

        var result = await _service.LoginAsync(request);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data?.Token);
        Assert.Equal("test@gmail.com", result.Data!.User.Email);
        Assert.Equal("Đăng nhập thành công.", result.Message);
    }

    [Fact]
    public async Task Login_WhenUserNotFound_ReturnsNotFound()
    {
        _mockUserManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

        var result = await _service.LoginAsync(new LoginRequest { Email = "noexist@gmail.com", Password = "Password123!" });

        Assert.False(result.IsSuccess);
        Assert.Equal("Tài khoản không tồn tại.", result.Error);
        _mockSignInManager.Verify(m => m.CheckPasswordSignInAsync(
            It.IsAny<User>(), It.IsAny<string>(), It.IsAny<bool>()), Times.Never);
    }

    [Fact]
    public async Task Login_WhenWrongPassword_ReturnsBadRequest()
    {
        var user = FakeUser();
        _mockUserManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);
        _mockSignInManager.Setup(m => m.CheckPasswordSignInAsync(user, "WrongPass", false))
                          .ReturnsAsync(SignInResult.Failed);

        var result = await _service.LoginAsync(new LoginRequest { Email = "test@gmail.com", Password = "WrongPass" });

        Assert.False(result.IsSuccess);
        Assert.Equal("Mật khẩu không chính xác.", result.Error);
    }

    [Fact]
    public async Task Login_WhenAccountLocked_ReturnsBadRequest()
    {
        var user = FakeUser(status: 0);
        _mockUserManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);
        _mockSignInManager.Setup(m => m.CheckPasswordSignInAsync(user, It.IsAny<string>(), false))
                          .ReturnsAsync(SignInResult.Success);

        var result = await _service.LoginAsync(new LoginRequest { Email = "test@gmail.com", Password = "Password123!" });

        Assert.False(result.IsSuccess);
        Assert.Equal("Tài khoản đã bị khóa.", result.Error);
        Assert.Null(result.Data);
    }

    [Fact]
    public async Task Login_WhenStatus2_ReturnsOk()
    {
        var user = FakeUser(status: 2);
        _mockUserManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);
        _mockSignInManager.Setup(m => m.CheckPasswordSignInAsync(user, It.IsAny<string>(), false))
                          .ReturnsAsync(SignInResult.Success);
        _mockUserManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { "User" });

        var result = await _service.LoginAsync(new LoginRequest { Email = "test@gmail.com", Password = "Password123!" });

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task Login_WhenSuccess_TokenContainsCorrectClaims()
    {
        var user = FakeUser();
        _mockUserManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);
        _mockSignInManager.Setup(m => m.CheckPasswordSignInAsync(user, It.IsAny<string>(), false))
                          .ReturnsAsync(SignInResult.Success);
        _mockUserManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { "User" });

        var result = await _service.LoginAsync(new LoginRequest { Email = "test@gmail.com", Password = "Password123!" });

        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(result.Data!.Token);

        Assert.Contains(jwt.Claims, c => c.Type == System.Security.Claims.ClaimTypes.Email && c.Value == "test@gmail.com");
        Assert.Contains(jwt.Claims, c => c.Type == System.Security.Claims.ClaimTypes.Role && c.Value == "User");
    }
}