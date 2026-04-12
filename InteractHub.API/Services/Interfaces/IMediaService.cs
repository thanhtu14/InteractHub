
namespace InteractHub.API.Services.Interfaces;

public interface IMediaService
{
    // Lưu file vào thư mục cục bộ và trả về URL (ví dụ: /images/posts/abc.jpg)
    Task<string?> SaveFileAsync(IFormFile? file, string folder);
    
    // Xóa file khỏi thư mục cục bộ
    void DeleteFile(string fileUrl);
}