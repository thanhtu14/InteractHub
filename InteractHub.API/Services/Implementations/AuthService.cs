using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Auth;
using InteractHub.API.DTOs.User;
using InteractHub.API.Entities;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace InteractHub.API.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _config;

    public AuthService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IConfiguration config)
    {
        _userManager   = userManager;
        _signInManager = signInManager;
        _config        = config;
    }

    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return Result<AuthResponse>.Conflict("Email đã được sử dụng.");

        var user = new User
        {
            FullName       = request.FullName,
            Email          = request.Email,
            UserName       = request.Email,
            Status         = 1,
            CreatedAt      = DateTime.UtcNow,
            ProfilePicture = "/images/avatars/default-avatar.png"
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return Result<AuthResponse>.BadRequest(
                string.Join(", ", result.Errors.Select(e => e.Description))
            );

        await _userManager.AddToRoleAsync(user, "User");

        var token = await GenerateJwtToken(user);
        return Result<AuthResponse>.Ok(await BuildAuthResponse(user, token), "Đăng ký thành công.");
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Result<AuthResponse>.NotFound("Tài khoản không tồn tại.");

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
            return Result<AuthResponse>.BadRequest("Mật khẩu không chính xác.");

        if (user.Status != 1)
            return Result<AuthResponse>.BadRequest("Tài khoản đã bị khóa.");

        var token = await GenerateJwtToken(user);
        return Result<AuthResponse>.Ok(await BuildAuthResponse(user, token), "Đăng nhập thành công.");
    }

    private async Task<string> GenerateJwtToken(User user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var secretKey   = jwtSettings["SecretKey"]!;
        var issuer      = jwtSettings["Issuer"]!;
        var audience    = jwtSettings["Audience"]!;
        var expireHours = int.Parse(jwtSettings["ExpireHours"] ?? "24");

        var roles = await _userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email ?? ""),
            new(ClaimTypes.Name, user.FullName ?? "")
        };

        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddHours(expireHours),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<AuthResponse> BuildAuthResponse(User user, string token)
    {
        var roles = await _userManager.GetRolesAsync(user);
        return new AuthResponse
        {
            Token = token,
            User  = new UserDto
            {
                Id        = user.Id,
                Username  = user.FullName ?? user.UserName ?? "",
                Email     = user.Email ?? "",
                AvatarUrl = user.ProfilePicture,
                Roles     = roles.ToList()
            }
        };
    }
}