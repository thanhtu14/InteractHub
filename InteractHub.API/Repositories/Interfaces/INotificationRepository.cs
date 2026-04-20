using InteractHub.API.Entities;

namespace InteractHub.API.Repositories.Interfaces;

// public interface INotificationRepository
// {
//     Task<IEnumerable<Notification>> GetByUserIdAsync(string userId);
//     Task<Notification?> GetByIdAsync(int id, string userId);
//     Task<int> CountUnreadAsync(string userId);
//     Task AddAsync(Notification notification);
//     void Update(Notification notification);
//     void Delete(Notification notification);
//     Task<bool> SaveChangesAsync();
// }



public interface INotificationRepository : IRepository<Notification> 
{
    // Lấy danh sách thông báo kèm theo thông tin người tương tác cuối (LastActor)
    Task<IEnumerable<Notification>> GetByUserIdAsync(string userId);

    // Tìm thông báo cũ dựa trên bài viết và loại để thực hiện GOM NHÓM
    Task<Notification?> GetExistingNotificationAsync(string receiverId, string type, string link);

    // Đếm số thông báo chưa đọc
    Task<int> CountUnreadAsync(string userId);

    // Lấy thông báo theo ID kèm theo dữ liệu User (LastActor) để hiển thị chi tiết
    Task<Notification?> GetByIdWithActorAsync(int id, string userId);
    Task<Notification?> GetByIdAndUserAsync(int id, string userId);
}