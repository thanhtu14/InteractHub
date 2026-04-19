using System.Text.RegularExpressions;
using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Hashtag;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;

namespace InteractHub.API.Services.Implementations;

public class HashtagService : IHashtagService
{
    private readonly IHashtagRepository _hashtagRepo;

    public HashtagService(IHashtagRepository hashtagRepo)
    {
        _hashtagRepo = hashtagRepo;
    }

    public async Task<Result<IEnumerable<HashtagResponseDto>>> GetAllAsync()
    {
        var hashtags = await _hashtagRepo.GetAllAsync();
        return Result<IEnumerable<HashtagResponseDto>>.Ok(
            hashtags.Select(h => new HashtagResponseDto { Id = h.Id, Tag = h.Tag! })
        );
    }

    public async Task<Result<HashtagResponseDto>> GetByTagAsync(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag))
            return Result<HashtagResponseDto>.BadRequest("Tag không được trống.");

        tag = NormalizeTag(tag);
        var hashtag = await _hashtagRepo.GetByTagAsync(tag);

        return hashtag == null
            ? Result<HashtagResponseDto>.NotFound("Hashtag không tồn tại.")
            : Result<HashtagResponseDto>.Ok(new HashtagResponseDto { Id = hashtag.Id, Tag = hashtag.Tag! });
    }

    // Không đổi vì được dùng nội bộ bởi PostService
    public async Task<HashtagResponseDto> CreateIfNotExistsAsync(string tag)
    {
        tag = NormalizeTag(tag);
        var existing = await _hashtagRepo.GetByTagAsync(tag);

        if (existing != null)
            return new HashtagResponseDto { Id = existing.Id, Tag = existing.Tag! };

        var newHashtag = new Hashtag { Tag = tag, CreatedAt = DateTime.UtcNow };
        await _hashtagRepo.AddAsync(newHashtag);
        await _hashtagRepo.SaveChangesAsync();

        return new HashtagResponseDto { Id = newHashtag.Id, Tag = newHashtag.Tag! };
    }

    // Không đổi vì được dùng nội bộ bởi PostService
    public async Task<List<HashtagResponseDto>> ExtractHashtagsAsync(string content)
    {
        var result = new List<HashtagResponseDto>();
        if (string.IsNullOrWhiteSpace(content)) return result;

        var matches = Regex.Matches(content, @"#[\p{L}0-9_]+");
        var uniqueTags = matches
            .Select(m => NormalizeTag(m.Value))
            .Distinct()
            .ToList();

        foreach (var tag in uniqueTags)
            result.Add(await CreateIfNotExistsAsync(tag));

        return result;
    }

    private static string NormalizeTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return "";
        tag = tag.Trim().ToLower();
        return tag.StartsWith("#") ? tag : "#" + tag;
    }
}