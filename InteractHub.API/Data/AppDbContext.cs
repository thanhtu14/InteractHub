using System;
using Microsoft.EntityFrameworkCore;
using InteractHub.API.Entities;

namespace InteractHub.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // DbSet
    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
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

        // --- 1. Friendship (Xử lý 2 khóa ngoại trỏ về cùng 1 bảng User) ---
        modelBuilder.Entity<Friendship>()
            .HasOne(f => f.Requester)
            .WithMany(u => u.RequestedFriends)
            .HasForeignKey(f => f.RequesterId)
            .OnDelete(DeleteBehavior.Restrict); // Dùng Restrict để tránh lỗi Multiple Paths

        modelBuilder.Entity<Friendship>()
            .HasOne(f => f.Receiver)
            .WithMany(u => u.ReceivedFriends)
            .HasForeignKey(f => f.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        // --- 2. Comment (Xử lý lỗi Multiple Cascade Paths giữa User và Post) ---
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Tắt cascade từ phía User

        // --- 3. Like (Nếu bảng Like cũng trỏ về cả User và Post, cần tắt 1 đầu) ---
        modelBuilder.Entity<Like>()
            .HasOne(l => l.User)
            .WithMany(u => u.Likes)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // --- 4. PostReport (Tương tự Comment và Like) ---
        modelBuilder.Entity<PostReport>()
            .HasOne(pr => pr.User)
            .WithMany(u => u.PostReports)
            .HasForeignKey(pr => pr.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // --- 5. Post_Hashtag (Quan hệ Nhiều - Nhiều) ---
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