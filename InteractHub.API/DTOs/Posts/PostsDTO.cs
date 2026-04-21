namespace InteractHub.API.DTOs.Posts;

public class PostCreateDto
{
    public string? Title { get; set; }
    public string? Content { get; set; }
    
    // Status nhận từ React (1: Public, 2: Friends, 3: Private)
    public int? Status { get; set; } 

    // Nhận danh sách file từ Form-Data
    public List<IFormFile>? Files { get; set; } 
}

public class PostResponseDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? UserId { get; set; }
    
    // Thêm trường này để hiển thị icon quyền riêng tư ở Newsfeed
    public int? Status { get; set; } 

    public string? AuthorName { get; set; }
    public string? AuthorAvatar { get; set; }
    public DateTime? CreatedAt { get; set; }
    
    // Danh sách URL ảnh/video để hiển thị
    public List<string> MediaUrls { get; set; } = new();
}

public class PostUpdateDto
{
    public string? Content { get; set; }
    public int? Status { get; set; }
    // Danh sách URL ảnh/video cần xóa
    public List<string>? DeleteMediaUrls { get; set; }
    // Danh sách file mới upload thêm
    public List<IFormFile>? NewFiles { get; set; }
}
public class PostReportRequestDTO
{
    public int PostId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class PostReportResponseDTO
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public int Status { get; set; }
    public DateTime CreatedAt { get; set; }
}











// ✅ DTO riêng cho kết quả tìm kiếm — có LikeCount, CommentCount, MediaUrls
public class PostSearchResponseDto
{
    public int Id { get; set; }
    public string? Content { get; set; }
    public string AuthorName { get; set; } = "";
    public string AuthorAvatar { get; set; } = "";
    public string AuthorId { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public List<string> MediaUrls { get; set; } = new();
}