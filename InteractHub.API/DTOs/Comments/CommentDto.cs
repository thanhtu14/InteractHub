namespace InteractHub.API.DTOs.Comments;

// DTOs/Comments/CommentResponseDTO.cs
public class CommentResponseDTO
{
    public int Id { get; set; }
    public string Content { get; set; } = "";
    public string UserId { get; set; } = "";
    public string UserName { get; set; } = "";
    public string? UserAvatar { get; set; }
    public int PostId { get; set; }
    public int? ParentId { get; set; }

    // === THÊM FIELD NÀY ===
    // Dùng để hiển thị: @ParentUserName nội dung bình luận...
    public string? ParentUserName { get; set; } 

    public DateTime CreatedAt { get; set; }
    public int LikeCount { get; set; }
    public bool IsLikedByCurrentUser { get; set; }
    
    // Danh sách các phản hồi
    public List<CommentResponseDTO> Replies { get; set; } = new();
}

// DTOs/Comments/CommentRequestDTO.cs
public class CommentRequestDTO
{
    public int PostId { get; set; }
    public string Content { get; set; } = "";
    public int? ParentId { get; set; }
}

// DTOs/Comments/CommentLikeResponseDTO.cs
public class CommentLikeResponseDTO
{
    public int CommentId { get; set; }
    public int LikeCount { get; set; }
    public bool IsLiked { get; set; }
}

// DTOs/Comments/CommentUpdateRequestDTO.cs
public class CommentUpdateRequestDTO
{
    public string Content { get; set; } = "";
}