using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Auth;

namespace InteractHub.API.Services.Interfaces;

public interface IAuthService
{
    Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request);
}