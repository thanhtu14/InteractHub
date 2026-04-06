using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InteractHub.API.DTOs;
using InteractHub.API.Entities;
using InteractHub.API.Repositories;
using Microsoft.IdentityModel.Tokens;

namespace InteractHub.API.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration  _config;

    public AuthService(IUserRepository userRepository, IConfiguration config)
    {
        _userRepository = userRepository;
        _config         = config;
    }

    // ── ĐĂNG KÝ ──────────────────────────────────────────────
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // 1. Kiểm tra email đã tồn tại chưa — gọi qua Repository
        var exists = await _userRepository.ExistsByEmailAsync(request.Email);
        if (exists)
            throw new Exception("Email đã được sử dụng.");

        // 2. Hash mật khẩu
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // 3. Tạo User mới
        var user = new User
        {
            FullName = request.FullName,
            Email    = request.Email,
            UserName = request.Email,
            Password = hashedPassword,
            Status   = 1,
        };

        // 4. Lưu vào database — gọi qua Repository
        var createdUser = await _userRepository.CreateAsync(user);

        // 5. Tạo JWT và trả về
        var token = GenerateJwtToken(createdUser);
        return BuildAuthResponse(createdUser, token);
    }

    // ── ĐĂNG NHẬP ────────────────────────────────────────────
    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // 1. Tìm user theo email — gọi qua Repository
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
            throw new Exception("Email không tồn tại.");

        // 2. Kiểm tra mật khẩu
        var isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
        if (!isValid)
            throw new Exception("Mật khẩu không chính xác.");

        // 3. Kiểm tra tài khoản có bị khóa không
        if (user.Status != 1)
            throw new Exception("Tài khoản đã bị khóa.");

        // 4. Tạo JWT và trả về
        var token = GenerateJwtToken(user);
        return BuildAuthResponse(user, token);
    }

    // ── TẠO JWT TOKEN ────────────────────────────────────────
    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var secretKey   = jwtSettings["SecretKey"]!;
        var issuer      = jwtSettings["Issuer"]!;
        var audience    = jwtSettings["Audience"]!;
        var expireHours = int.Parse(jwtSettings["ExpireHours"] ?? "24");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email,          user.Email ?? ""),
            new Claim(ClaimTypes.Name,           user.FullName ?? ""),
            new Claim(ClaimTypes.Role,           "User"),
        };

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

    // ── BUILD RESPONSE ───────────────────────────────────────
    private static AuthResponse BuildAuthResponse(User user, string token)
    {
        return new AuthResponse
        {
            Token = token,
            User  = new UserDto
            {
                Id        = user.Id.ToString(),
                Username  = user.FullName ?? user.UserName ?? "",
                Email     = user.Email ?? "",
                AvatarUrl = user.ProfilePicture,
                Roles     = new List<string> { "User" },
            },
        };
    }
}