using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using InteractHub.API.Entities;

namespace InteractHub.API.Data;

public class AppDbContext : IdentityDbContext<User>
{
      public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

      public DbSet<Post> Posts { get; set; }
      public DbSet<PostMedia> PostMedias { get; set; }
      public DbSet<Story> Stories { get; set; }
      public DbSet<Like> Likes { get; set; }
      public DbSet<Comment> Comments { get; set; }
      public DbSet<Hashtag> Hashtags { get; set; }
      public DbSet<Notification> Notifications { get; set; }
      public DbSet<PostReport> PostReports { get; set; }
      public DbSet<Friendship> Friendships { get; set; }
      public DbSet<Post_Hashtag> PostHashtags { get; set; }
      public DbSet<CommentLike> CommentLikes { get; set; }

      protected override void OnModelCreating(ModelBuilder modelBuilder)
      {
            base.OnModelCreating(modelBuilder);

            // --- 1. Cấu hình Post ---
            modelBuilder.Entity<Post>(entity =>
            {
                  entity.Property(p => p.CreatedAt)
                    .HasDefaultValueSql("GETDATE()");

                  // Một Post có nhiều Like, xóa Post thì xóa Like
                  entity.HasMany(p => p.Likes)
                    .WithOne(l => l.Post)
                    .HasForeignKey(l => l.PostId)
                    .OnDelete(DeleteBehavior.Cascade);

                  // Một Post có nhiều Comment, xóa Post thì xóa Comment
                  entity.HasMany(p => p.Comments)
                    .WithOne(c => c.Post)
                    .HasForeignKey(c => c.PostId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // --- 2. Cấu hình PostMedia ---
            modelBuilder.Entity<PostMedia>()
                .HasOne(pm => pm.Post)
                .WithMany(p => p.PostMedias)
                .HasForeignKey(pm => pm.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- 3. Cấu hình Like ---
            modelBuilder.Entity<Like>(entity =>
            {
                  // Chuyển Enum ReactionType thành int trong Database
                  entity.Property(l => l.Type)
                    .HasConversion<int>()
                    .IsRequired();

                  entity.Property(l => l.Status)
                    .HasDefaultValue(1);

                  entity.Property(l => l.CreatedAt)
                    .HasDefaultValueSql("GETDATE()");

                  // Quan hệ với User
                  entity.HasOne(l => l.User)
                    .WithMany(u => u.Likes)
                    .HasForeignKey(l => l.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // --- 4. Cấu hình Comment ---
            modelBuilder.Entity<Comment>(entity =>
            {
                  entity.Property(c => c.CreatedAt)
            .HasDefaultValueSql("GETDATE()");

                  entity.Property(c => c.Status)
            .HasDefaultValue(1);

                  // ✅ Xóa entity.Property(c => c.Like) — không còn cột này

                  entity.HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

                  entity.HasOne(c => c.Parent)
            .WithMany(c => c.Replies)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
            });



            // --- 5. Friendship ---
            modelBuilder.Entity<Friendship>(entity =>
            {
                  entity.HasOne(f => f.Requester)
                    .WithMany(u => u.RequestedFriends)
                    .HasForeignKey(f => f.RequesterId)
                    .OnDelete(DeleteBehavior.Restrict);

                  entity.HasOne(f => f.Receiver)
                    .WithMany(u => u.ReceivedFriends)
                    .HasForeignKey(f => f.ReceiverId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // --- 6. PostReport ---
            modelBuilder.Entity<PostReport>(entity =>
            {
                  entity.HasOne(pr => pr.User)
                  .WithMany(u => u.PostReports)
                  .HasForeignKey(pr => pr.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
                  entity.HasIndex(pr => new { pr.UserId, pr.PostId }).IsUnique();
            });



            // --- 7. Hashtag & Many-to-Many ---
            modelBuilder.Entity<Hashtag>(entity =>
            {
                  entity.HasIndex(h => h.Tag).IsUnique();
                  entity.Property(h => h.Tag).IsRequired().HasMaxLength(100);
            });

            modelBuilder.Entity<Post_Hashtag>(entity =>
            {
                  entity.HasKey(ph => new { ph.PostId, ph.HashtagId });

                  entity.HasOne(ph => ph.Post)
                    .WithMany(p => p.Post_Hashtags)
                    .HasForeignKey(ph => ph.PostId);

                  entity.HasOne(ph => ph.Hashtag)
                    .WithMany(h => h.Post_Hashtags)
                    .HasForeignKey(ph => ph.HashtagId);
            });
            modelBuilder.Entity<CommentLike>()
                .HasKey(cl => new { cl.CommentId, cl.UserId }); // Khóa chính là cặp Id này
            // --- 8. Cấu hình CommentLike ---
            modelBuilder.Entity<CommentLike>(entity =>
            {
                  // ✅ Composite key
                  entity.HasKey(cl => new { cl.CommentId, cl.UserId });

                  // ✅ Quan hệ với Comment — xóa Comment thì xóa hết like
                  entity.HasOne(cl => cl.Comment)
            .WithMany(c => c.CommentLikes)
            .HasForeignKey(cl => cl.CommentId)
            .OnDelete(DeleteBehavior.Cascade);

                  // ✅ Quan hệ với User — xóa User thì xóa hết like của user đó
                  entity.HasOne(cl => cl.User)
            .WithMany()
            .HasForeignKey(cl => cl.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Restrict để tránh multiple cascade paths
            });
      }
}