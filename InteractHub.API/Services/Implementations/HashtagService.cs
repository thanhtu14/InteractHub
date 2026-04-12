using System.Text.RegularExpressions;
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

    // ================= GET ALL =================
    public async Task<IEnumerable<HashtagResponseDto>> GetAllAsync()
    {
        var hashtags = await _hashtagRepo.GetAllAsync();

        return hashtags.Select(h => new HashtagResponseDto
        {
            Id = h.Id,
            Tag = h.Tag!
        });
    }

    // ================= GET BY TAG =================
    public async Task<HashtagResponseDto?> GetByTagAsync(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return null;

        tag = NormalizeTag(tag);

        var hashtag = await _hashtagRepo.GetByTagAsync(tag);
        if (hashtag == null) return null;

        return new HashtagResponseDto
        {
            Id = hashtag.Id,
            Tag = hashtag.Tag!
        };
    }

    // ================= CREATE IF NOT EXISTS =================
    public async Task<HashtagResponseDto> CreateIfNotExistsAsync(string tag)
    {
        tag = NormalizeTag(tag);

        var existing = await _hashtagRepo.GetByTagAsync(tag);

        if (existing != null)
        {
            return new HashtagResponseDto
            {
                Id = existing.Id,
                Tag = existing.Tag!
            };
        }

        var newHashtag = new Hashtag
        {
            Tag = tag, // luôn lưu dạng #abc
            CreatedAt = DateTime.UtcNow
        };

        await _hashtagRepo.AddAsync(newHashtag);
        await _hashtagRepo.SaveChangesAsync();

        return new HashtagResponseDto
        {
            Id = newHashtag.Id,
            Tag = newHashtag.Tag!
        };
    }

    // ================= EXTRACT HASHTAG =================
    public async Task<List<HashtagResponseDto>> ExtractHashtagsAsync(string content)
    {
        var result = new List<HashtagResponseDto>();

        if (string.IsNullOrWhiteSpace(content))
            return result;

        // 🔥 Regex chuẩn: hỗ trợ tiếng Việt + số + _
        var matches = Regex.Matches(content, @"#[\p{L}0-9_]+");

        // 👉 Lọc unique + normalize
        var uniqueTags = matches
            .Select(m => NormalizeTag(m.Value))
            .Distinct()
            .ToList();

        foreach (var tag in uniqueTags)
        {
            var hashtag = await CreateIfNotExistsAsync(tag);
            result.Add(hashtag);
        }

        return result;
    }

    // ================= HELPER =================
    private string NormalizeTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return "";

        tag = tag.Trim().ToLower();

        // đảm bảo luôn có #
        if (!tag.StartsWith("#"))
        {
            tag = "#" + tag;
        }

        return tag;
    }
}