using InteractHub.API.Entities;

namespace InteractHub.API.Repositories.Interfaces;

public interface IPostRepository
{
    // Các phương thức cơ bản từ Generic (nếu bạn có IRepository chung thì kế thừa, nếu không thì khai báo dưới đây)
    Task AddAsync(Post post);
    void Update(Post post);
    void Delete(Post post);
    Task<bool> SaveChangesAsync();
    Task<Post?> GetByIdAsync(int id);

    // Các phương thức lấy dữ liệu chi tiết
    Task<IEnumerable<Post>> GetPostsWithDetailsAsync(); // Lấy bảng tin chung
    Task<IEnumerable<Post>> GetPostsByUserIdAsync(string userId); // Lấy bài viết của 1 người
    Task<Post?> GetPostDetailsByIdAsync(int id); // Lấy chi tiết 1 bài viết kèm Media/Like/Comment
}