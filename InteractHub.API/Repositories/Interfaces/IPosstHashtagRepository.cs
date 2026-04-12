using InteractHub.API.Entities;

namespace InteractHub.API.Repositories.Interfaces;

public interface IPostHashtagRepository
{
    Task AddAsync(Post_Hashtag entity);
    Task AddRangeAsync(IEnumerable<Post_Hashtag> entities);

    Task<IEnumerable<Post_Hashtag>> GetByPostIdAsync(int postId);

    Task DeleteByPostIdAsync(int postId);

    Task<bool> SaveChangesAsync();
}