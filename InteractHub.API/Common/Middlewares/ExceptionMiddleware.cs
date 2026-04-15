using InteractHub.API.Common.Responses;
namespace InteractHub.API.Common.Middlewares;
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(RequestDelegate next, IHostEnvironment env)
    {
        _next = next;
        _env = env;
    }

    public async Task Invoke(HttpContext context)
    {
        try { await _next(context); }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            // Chỉ hiện chi tiết lỗi khi đang ở môi trường Development
            var message = _env.IsDevelopment() ? ex.Message : "An internal server error occurred.";
            await context.Response.WriteAsJsonAsync(ApiResponse<string>.Fail(message));
        }
    }
}