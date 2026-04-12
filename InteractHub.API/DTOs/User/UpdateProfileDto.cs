using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.DTOs.User;

/// <summary>Payload cho PUT api/users/update</summary>
public class UpdateProfileDto
{
    // ── Thông tin cơ bản ─────────────────────────────────────

    [Required(ErrorMessage = "Tên hiển thị không được để trống.")]
    [MaxLength(100, ErrorMessage = "Tên hiển thị không được quá 100 ký tự.")]
    public string UserName { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Số điện thoại không đúng định dạng.")]
    [MaxLength(20, ErrorMessage = "Số điện thoại không được quá 20 ký tự.")]
    public string? Phone { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [MaxLength(500, ErrorMessage = "Tiểu sử không được quá 500 ký tự.")]
    public string? Bio { get; set; }

    public string? Gender { get; set; }

    // URL ảnh — thường không cần validate độ dài quá gắt vì là link từ Cloudinary/Firebase
    public string? AvatarUrl { get; set; }
    public string? CoverUrl  { get; set; }

    // ── Đổi mật khẩu (tuỳ chọn) ─────────────────────────────

    [DataType(DataType.Password)]
    public string? CurrentPassword { get; set; }

    [MinLength(6, ErrorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự.")]
    [DataType(DataType.Password)]
    public string? NewPassword { get; set; }

    [Compare("NewPassword", ErrorMessage = "Mật khẩu xác nhận không khớp.")]
    [DataType(DataType.Password)]
    public string? ConfirmNewPassword { get; set; }
}