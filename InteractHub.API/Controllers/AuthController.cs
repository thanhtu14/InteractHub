using InteractHub.API.DTOs;
using InteractHub.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // POST api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(result); // 200 + { token, user }
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message }); // 400 + { message }
        }
    }

    // POST api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            return Ok(result); // 200 + { token, user }
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message }); // 401 + { message }
        }
    }
}