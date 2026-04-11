using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.DTOs.User;

/// <summary>Payload cho PUT api/users/update</summary>
public class UpdateProfileDto
{
    // ── Thông tin cơ bản ─────────────────────────────────────

    
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    
    [MaxLength(20)]
    public string? Phone { get; set; }

    public DateTime? DateOfBirth { get; set; }
    public DateTime? CreatedAt { get; set; }

   
    public string? Bio { get; set; }
    public string? Gender { get; set; }

    // URL ảnh — đã được upload qua /upload-avatar & /upload-cover
    public string? AvatarUrl { get; set; }
    public string? CoverUrl  { get; set; }

    // ── Đổi mật khẩu (tuỳ chọn) ─────────────────────────────
    public string? CurrentPassword    { get; set; }

  
    public string? NewPassword        { get; set; }

    public string? ConfirmNewPassword { get; set; }
}