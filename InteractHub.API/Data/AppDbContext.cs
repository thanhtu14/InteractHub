using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using InteractHub.API.Entities;

namespace InteractHub.API.Data;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Post> Posts { get; set; }
    // --- THÊM DÒNG NÀY ---
    public DbSet<PostMedia> PostMedias { get; set; } 
    
    public DbSet<Story> Stories { get; set; }
    public DbSet<Like> Likes { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Hashtag> Hashtags { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<PostReport> PostReports { get; set; }
    public DbSet<Friendship> Friendships { get; set; }
    public DbSet<Post_Hashtag> PostHashtags { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); 

        // --- Cấu hình tự động tạo ngày cho Post ---
        modelBuilder.Entity<Post>()
            .Property(p => p.CreatedAt)
            .HasDefaultValueSql("GETDATE()");

        // --- Cấu hình PostMedia (Quan hệ 1-N với Post) ---
        modelBuilder.Entity<PostMedia>()
            .HasOne(pm => pm.Post)
            .WithMany(p => p.PostMedias)
            .HasForeignKey(pm => pm.PostId)
            .OnDelete(DeleteBehavior.Cascade); // Xóa Post thì xóa luôn Media

        // --- 1. Friendship ---
        modelBuilder.Entity<Friendship>()
            .HasOne(f => f.Requester)
            .WithMany(u => u.RequestedFriends)
            .HasForeignKey(f => f.RequesterId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Friendship>()
            .HasOne(f => f.Receiver)
            .WithMany(u => u.ReceivedFriends)
            .HasForeignKey(f => f.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        // --- 2. Comment ---
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // --- 3. Like ---
        modelBuilder.Entity<Like>()
            .HasOne(l => l.User)
            .WithMany(u => u.Likes)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // --- 4. PostReport ---
        modelBuilder.Entity<PostReport>()
            .HasOne(pr => pr.User)
            .WithMany(u => u.PostReports)
            .HasForeignKey(pr => pr.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // --- 5. Post_Hashtag ---
        modelBuilder.Entity<Post_Hashtag>()
            .HasKey(ch => new { ch.PostId, ch.HashtagId });

        modelBuilder.Entity<Post_Hashtag>()
            .HasOne(ch => ch.Post)
            .WithMany(c => c.Post_Hashtags)
            .HasForeignKey(ch => ch.PostId);

        modelBuilder.Entity<Post_Hashtag>()
            .HasOne(ch => ch.Hashtag)
            .WithMany(h => h.Post_Hashtags)
            .HasForeignKey(ch => ch.HashtagId);
    }
}