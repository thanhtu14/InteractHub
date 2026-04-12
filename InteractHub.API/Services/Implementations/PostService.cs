using System.Text.RegularExpressions;
using InteractHub.API.DTOs.Posts;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;

namespace InteractHub.API.Services.Implementations;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepo;
    private readonly IMediaService _mediaService;
    private readonly IHashtagService _hashtagService;
    private readonly IPostHashtagRepository _postHashtagRepo;

    public PostService(
        IPostRepository postRepo,
        IMediaService mediaService,
        IHashtagService hashtagService,
        IPostHashtagRepository postHashtagRepo)
    {
        _postRepo = postRepo;
        _mediaService = mediaService;
        _hashtagService = hashtagService;
        _postHashtagRepo = postHashtagRepo;
    }

    // ================= CREATE =================
    public async Task<PostResponseDto> CreatePostAsync(string userId, PostCreateDto dto)
    {
        var post = new Post
        {
            UserId = userId,
            Title = dto.Title,
            Content = dto.Content,
            Status = dto.Status ?? 1,
            CreatedAt = DateTime.UtcNow,
            PostMedias = new List<PostMedia>()
        };

        // Upload media
        if (dto.Files != null && dto.Files.Any())
        {
            foreach (var file in dto.Files)
            {
                var url = await _mediaService.SaveFileAsync(file, "posts");

                if (!string.IsNullOrEmpty(url))
                {
                    post.PostMedias.Add(new PostMedia
                    {
                        Url = url,
                        MediaType = file.ContentType.Contains("video") ? 1 : 0
                    });
                }
            }
        }

        await _postRepo.AddAsync(post);
        await _postRepo.SaveChangesAsync();

        // 🔥 HANDLE HASHTAG
        await HandleHashtagsAsync(post.Id, post.Content);

        var result = await _postRepo.GetPostDetailsByIdAsync(post.Id);
        return MapToDto(result ?? post);
    }

    // ================= UPDATE =================
    public async Task<PostResponseDto> UpdatePostAsync(int postId, string userId, PostUpdateDto dto)
    {
        var post = await _postRepo.GetPostDetailsByIdAsync(postId);
        if (post == null) throw new Exception("Bài viết không tồn tại.");
        if (post.UserId != userId) throw new Exception("Không có quyền.");

        if (dto.Content != null) post.Content = dto.Content;
        if (dto.Status != null) post.Status = dto.Status.Value;

        // XÓA MEDIA
        if (dto.DeleteMediaUrls != null && dto.DeleteMediaUrls.Any())
        {
            var deleteList = post.PostMedias
                .Where(m => dto.DeleteMediaUrls.Contains(m.Url))
                .ToList();

            foreach (var m in deleteList)
            {
                _mediaService.DeleteFile(m.Url);
                post.PostMedias.Remove(m);
            }
        }

        // THÊM MEDIA
        if (dto.NewFiles != null && dto.NewFiles.Any())
        {
            foreach (var file in dto.NewFiles)
            {
                var url = await _mediaService.SaveFileAsync(file, "posts");

                if (!string.IsNullOrEmpty(url))
                {
                    post.PostMedias.Add(new PostMedia
                    {
                        Url = url,
                        MediaType = file.ContentType.Contains("video") ? 1 : 0
                    });
                }
            }
        }

        // 🔥 UPDATE HASHTAG
        if (dto.Content != null)
        {
            await _postHashtagRepo.DeleteByPostIdAsync(post.Id);
            await HandleHashtagsAsync(post.Id, post.Content);
        }

        await _postRepo.SaveChangesAsync();

        var updated = await _postRepo.GetPostDetailsByIdAsync(post.Id);
        return MapToDto(updated ?? post);
    }

    // ================= DELETE =================
    public async Task DeletePostAsync(int postId, string userId)
    {
        var post = await _postRepo.GetPostDetailsByIdAsync(postId);
        if (post == null) throw new Exception("Không tìm thấy.");
        if (post.UserId != userId) throw new Exception("Không có quyền.");

        if (post.PostMedias != null)
        {
            foreach (var m in post.PostMedias)
            {
                _mediaService.DeleteFile(m.Url);
            }
        }

        await _postHashtagRepo.DeleteByPostIdAsync(post.Id);

        _postRepo.Delete(post);
        await _postRepo.SaveChangesAsync();
    }

    // ================= GET =================
    public async Task<IEnumerable<PostResponseDto>> GetTimelineAsync()
    {
        var posts = await _postRepo.GetPostsWithDetailsAsync();
        return posts.Select(MapToDto);
    }

    public async Task<IEnumerable<PostResponseDto>> GetPostsByUserIdAsync(string userId)
    {
        var posts = await _postRepo.GetPostsByUserIdAsync(userId);
        return posts.Select(MapToDto);
    }

    public async Task<PostResponseDto> GetPostByIdAsync(int postId)
    {
        var post = await _postRepo.GetPostDetailsByIdAsync(postId);
        if (post == null) throw new Exception("Không tồn tại.");
        return MapToDto(post);
    }

    // ================= HASHTAG CORE =================
    private async Task HandleHashtagsAsync(int postId, string? content)
{
    if (string.IsNullOrWhiteSpace(content)) return;

    // 👉 Dùng service đã có (đã xử lý: extract + create nếu chưa tồn tại)
    var hashtags = await _hashtagService.ExtractHashtagsAsync(content);

    if (hashtags == null || !hashtags.Any()) return;

    // 👉 Map sang bảng Post_Hashtag
    var mappings = hashtags.Select(tag => new Post_Hashtag
    {
        PostId = postId,
        HashtagId = tag.Id
    }).ToList();

    await _postHashtagRepo.AddRangeAsync(mappings);
    await _postHashtagRepo.SaveChangesAsync();
}

    // ================= DTO =================
    private static PostResponseDto MapToDto(Post p) => new()
    {
        Id = p.Id,
        Title = p.Title,
        Content = p.Content,
        UserId = p.UserId,
        Status = p.Status,
        AuthorName = p.User?.FullName ?? p.User?.UserName ?? "User",
        AuthorAvatar = p.User?.ProfilePicture ?? "",
        CreatedAt = p.CreatedAt,
        MediaUrls = p.PostMedias?.Select(m => m.Url).ToList() ?? new List<string>()
    };
}