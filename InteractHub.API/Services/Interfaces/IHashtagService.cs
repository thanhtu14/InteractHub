using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Hashtag;

namespace InteractHub.API.Services.Interfaces;

public interface IHashtagService
{
    Task<Result<IEnumerable<HashtagResponseDto>>> GetAllAsync();
    Task<Result<HashtagResponseDto>> GetByTagAsync(string tag);
    Task<HashtagResponseDto> CreateIfNotExistsAsync(string tag);
    Task<List<HashtagResponseDto>> ExtractHashtagsAsync(string content);
}