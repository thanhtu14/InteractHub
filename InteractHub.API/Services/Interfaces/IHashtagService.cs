using InteractHub.API.DTOs.Hashtag;

namespace InteractHub.API.Services.Interfaces;

public interface IHashtagService
{
    Task<IEnumerable<HashtagResponseDto>> GetAllAsync();
    Task<HashtagResponseDto?> GetByTagAsync(string tag);
    Task<HashtagResponseDto> CreateIfNotExistsAsync(string tag);
    Task<List<HashtagResponseDto>> ExtractHashtagsAsync(string content);
}