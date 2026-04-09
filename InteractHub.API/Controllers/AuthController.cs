using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InteractHub.API.DTOs.Auth;
using InteractHub.API.DTOs.User;
using UserEntity = InteractHub.API.Entities.User; // Đặt tên đại diện là UserEntity
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly UserManager<UserEntity> _userManager;
    private readonly IConfiguration _config;

    public AuthController(
        IAuthService authService,
        UserManager<UserEntity> userManager,
        IConfiguration config)
    {
        _authService = authService;
        _userManager = userManager;
        _config = config;
    }

    // ── 1. Register ──────────────────────────────────────────────
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

    // ── 2. Login ────────────────────────────────────────────────
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

    // ── 3. Google OAuth ─────────────────────────────────────────
    [HttpGet("google")]
    public IActionResult GoogleLogin()
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(GoogleCallback)),
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

        var email = result.Principal.FindFirstValue(ClaimTypes.Email) ?? "";
        var fullName = result.Principal.FindFirstValue(ClaimTypes.Name) ?? "";
        var avatar =
            result.Principal.FindFirstValue("picture") ??
            result.Principal.FindFirstValue("urn:google:picture") ??
            "";

        return await HandleOAuthLogin(email, fullName, avatar);
    }

    // ── 4. GitHub OAuth ─────────────────────────────────────────
    [HttpGet("github")]
    public async Task<IActionResult> GitHubLogin()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        var properties = new AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(GitHubCallback)),
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

        var email = result.Principal.FindFirstValue(ClaimTypes.Email) ?? "";
        var fullName =
            result.Principal.FindFirstValue(ClaimTypes.Name) ??
            result.Principal.FindFirstValue("login") ??
            "";

        var avatar =
            result.Principal.FindFirstValue("urn:github:avatar_url") ??
            result.Principal.FindFirstValue("avatar_url") ??
            "";

        return await HandleOAuthLogin(email, fullName, avatar);
    }

    // ── 5. Handle OAuth chung ───────────────────────────────────
    private async Task<IActionResult> HandleOAuthLogin(string email, string fullName, string avatar = "/images/avatars/default-avatar.png")
    {
        if (string.IsNullOrEmpty(email))
            return Redirect("http://localhost:5173/login?error=no_email");

        var user = await _userManager.FindByEmailAsync(email);

        // 🔥 nếu chưa có user → tạo mới
        if (user == null)
        {
            user = new UserEntity
            {
                Email = email,
                UserName = email,
                FullName = fullName,
                ProfilePicture = avatar,
                Status = 1
            };

            var result = await _userManager.CreateAsync(user);

            if (!result.Succeeded)
                return Redirect("http://localhost:5173/login?error=create_user_failed");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = GenerateJwtToken(user, roles);

        var userDto = new UserDto
        {
            Id = user.Id,
            Username = user.FullName ?? user.UserName ?? "User",
            Email = user.Email ?? "",
            AvatarUrl = user.ProfilePicture,
            Roles = roles.ToList()
        };

        var userJson = Uri.EscapeDataString(
            System.Text.Json.JsonSerializer.Serialize(userDto)
        );

        return Redirect($"http://localhost:5173/oauth-callback?token={token}&user={userJson}");
    }

    // ── 6. Generate JWT ─────────────────────────────────────────
    private string GenerateJwtToken(UserEntity user, IList<string> roles)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]!;

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Name, user.FullName ?? user.UserName ?? "")
        };

        // 🔥 add roles
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}