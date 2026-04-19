namespace InteractHub.API.Common.Responses;
public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Data { get; }
    public string? Error { get; }
    public string? Message { get; }  // ✅ thêm
    public int StatusCode { get; }

    private Result(bool isSuccess, T? data, string? error, string? message, int statusCode)
    {
        IsSuccess = isSuccess;
        Data = data;
        Error = error;
        Message = message;
        StatusCode = statusCode;
    }

    public static Result<T> Ok(T? data = default, string message = "Success")
        => new(true, data, null, message, 200);

    public static Result<T> NotFound(string error)
        => new(false, default, error, null, 404);

    public static Result<T> Conflict(string error)
        => new(false, default, error, null, 409);

    public static Result<T> BadRequest(string error)
        => new(false, default, error, null, 400);

    public static Result<T> ServerError(string error)
        => new(false, default, error, null, 500);
}