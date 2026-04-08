using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InteractHub.API.Data;
using InteractHub.API.DTOs;
using InteractHub.API.Entities;
using InteractHub.API.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService  _authService;
    private readonly AppDbContext  _db;
    private readonly IConfiguration _config;

    public AuthController(IAuthService authService, AppDbContext db, IConfiguration config)
    {
        _authService = authService;
        _db          = db;
        _config      = config;
    }

    // ── 1. Đăng ký & Đăng nhập truyền thống ──────────────────────
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await _authService.LoginAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    // ── 2. Google OAuth ─────────────────────────────────────────
    [HttpGet("google")]
    public IActionResult GoogleLogin()
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(GoogleCallback)),
            // Ép buộc Google hiển thị bảng chọn tài khoản
            Items = { { "prompt", "select_account" } }
        };
        return Challenge(properties, "Google");
    }

    [HttpGet("google-callback")]
    public async Task<IActionResult> GoogleCallback()
    {
        var result = await HttpContext.AuthenticateAsync("Google");
        
        if (!result.Succeeded)
            return Redirect("http://localhost:5173/login?error=google_failed");

        var email    = result.Principal.FindFirstValue(ClaimTypes.Email) ?? "";
        var fullName = result.Principal.FindFirstValue(ClaimTypes.Name)  ?? "";
        // Lấy avatar từ các key phổ biến của Google
        var avatar   = result.Principal.FindFirstValue("picture") 
                       ?? result.Principal.FindFirstValue("urn:google:picture") 
                       ?? "";

        return await HandleOAuthLogin(email, fullName, avatar);
    }

    // ── 3. GitHub OAuth ─────────────────────────────────────────
    [HttpGet("github")]
    public async Task<IActionResult> GitHubLogin()
    {
        // Xóa session cũ của Middleware để đảm bảo không bị dính vết đăng nhập trước đó
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        var properties = new AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(GitHubCallback)),
            // Ép buộc hiển thị màn hình phê duyệt/chọn lại nếu có thể
            Items = { { "prompt", "select_account" } }
        };
        return Challenge(properties, "GitHub");
    }

    [HttpGet("github-callback")]
    public async Task<IActionResult> GitHubCallback()
    {
        var result = await HttpContext.AuthenticateAsync("GitHub");
        if (!result.Succeeded)
            return Redirect("http://localhost:5173/login?error=github_failed");

        var email    = result.Principal.FindFirstValue(ClaimTypes.Email);
        var fullName = result.Principal.FindFirstValue(ClaimTypes.Name) 
                       ?? result.Principal.FindFirstValue("login"); // Username GitHub
        
        var avatar   = result.Principal.FindFirstValue("urn:github:avatar_url") 
                       ?? result.Principal.FindFirstValue("avatar_url") 
                       ?? "";

        return await HandleOAuthLogin(email ?? "", fullName ?? "", avatar);
    }

    // ── 4. Xử lý logic chung cho OAuth ──────────────────────────
    private async Task<IActionResult> HandleOAuthLogin(string email, string fullName, string avatar)
    {
        if (string.IsNullOrEmpty(email))
            return Redirect("http://localhost:5173/login?error=no_email");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        // Nếu chưa có user trong DB -> Tạo mới (Đăng ký tự động)
        if (user == null)
        {
            user = new User
            {
                FullName       = fullName,
                Email           = email,
                UserName       = email, 
                ProfilePicture = avatar,
                // Password ngẫu nhiên vì login qua Social
                Password       = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), 
                Status         = 1,
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        var token = GenerateJwtToken(user);
        
        var userDto = new UserDto
        {
            Id        = user.Id.ToString(),
            Username  = user.FullName ?? user.UserName ?? "User",
            Email     = user.Email    ?? "",
            AvatarUrl = user.ProfilePicture,
            Roles     = new List<string> { "User" },
        };

        // Serialize và Encode để truyền qua URL an toàn
        var userJson = Uri.EscapeDataString(System.Text.Json.JsonSerializer.Serialize(userDto));
        
        return Redirect($"http://localhost:5173/oauth-callback?token={token}&user={userJson}");
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is missing");

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email,          user.Email    ?? ""),
            new Claim(ClaimTypes.Name,           user.FullName ?? user.UserName ?? ""),
            new Claim(ClaimTypes.Role,           "User"),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer:             jwtSettings["Issuer"],
            audience:           jwtSettings["Audience"],
            claims:             claims,
            expires:            DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}