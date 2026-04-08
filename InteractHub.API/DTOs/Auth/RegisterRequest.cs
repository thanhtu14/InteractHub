using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.DTOs;

public class RegisterRequest
{
    [Required(ErrorMessage = "Họ tên không được để trống.")]
    [StringLength(100, ErrorMessage = "Họ tên không quá 100 ký tự.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email là bắt buộc.")]
    [EmailAddress(ErrorMessage = "Định dạng Email không hợp lệ.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu không được để trống.")]
    [MinLength(8, ErrorMessage = "Mật khẩu phải có ít nhất 8 ký tự.")]
    public string Password { get; set; } = string.Empty;
}