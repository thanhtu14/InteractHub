using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.DTOs.User;

/// <summary>Payload cho PUT api/users/update</summary>
public class UpdateProfileDto
{
    // ── Thông tin cơ bản ─────────────────────────────────────

    [Required(ErrorMessage = "Họ và tên không được để trống.")]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
    [MaxLength(20)]
    public string? Phone { get; set; }

    public DateTime? DateOfBirth { get; set; }
    public DateTime? CreatedAt { get; set; }

    [MaxLength(160, ErrorMessage = "Tiểu sử tối đa 160 ký tự.")]
    public string? Bio { get; set; }
    public string? Gender { get; set; }

    // URL ảnh — đã được upload qua /upload-avatar & /upload-cover
    public string? AvatarUrl { get; set; }
    public string? CoverUrl  { get; set; }

    // ── Đổi mật khẩu (tuỳ chọn) ─────────────────────────────
    public string? CurrentPassword    { get; set; }

    [MinLength(8, ErrorMessage = "Mật khẩu mới tối thiểu 8 ký tự.")]
    public string? NewPassword        { get; set; }

    public string? ConfirmNewPassword { get; set; }
}