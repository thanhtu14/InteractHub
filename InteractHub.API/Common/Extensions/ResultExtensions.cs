using InteractHub.API.Common.Responses;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Common.Extensions;

public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(this Result<T> result, ControllerBase controller)
{
    if (result.IsSuccess)
        return controller.Ok(ApiResponse<T>.Ok(result.Data, result.Message ?? "Success"));

    return result.StatusCode switch
    {
        400 => controller.BadRequest(ApiResponse<T>.Fail(result.Error!)),
        404 => controller.NotFound(ApiResponse<T>.Fail(result.Error!)),
        409 => controller.Conflict(ApiResponse<T>.Fail(result.Error!)),
        _   => controller.StatusCode(500, ApiResponse<T>.Fail(result.Error!))
    };
}
}