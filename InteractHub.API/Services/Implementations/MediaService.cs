using InteractHub.API.Services.Interfaces;

namespace InteractHub.API.Services.Implementations;

public class MediaService : IMediaService
{
    private readonly IWebHostEnvironment _env;

    public MediaService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string?> SaveFileAsync(IFormFile? file, string folder)
    {
        // 1. Kiểm tra file trống
        if (file is null || file.Length == 0) return null;

        // 2. Kiểm tra dung lượng (Ví dụ: tối đa 5MB)
        if (file.Length > 5 * 1024 * 1024) return null;

        // 3. Kiểm tra định dạng (Cho phép cả video nếu cần)
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".mov" };
        var ext = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(ext)) return null;

        // 4. Thiết lập đường dẫn thư mục lưu trữ (wwwroot/images/{folder})
        var uploadDir = Path.Combine(_env.WebRootPath, "images", folder);
        if (!Directory.Exists(uploadDir))
        {
            Directory.CreateDirectory(uploadDir);
        }

        // 5. Tạo tên file duy nhất bằng Guid để tránh trùng lặp
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadDir, fileName);

        // 6. Lưu file vào ổ đĩa
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // 7. Trả về đường dẫn tương đối để lưu vào Database
        return $"/images/{folder}/{fileName}";
    }

    public void DeleteFile(string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl)) return;

        // Chuyển từ URL (/images/posts/abc.jpg) sang đường dẫn vật lý trên ổ đĩa
        var filePath = Path.Combine(_env.WebRootPath, fileUrl.TrimStart('/'));

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
    }
}