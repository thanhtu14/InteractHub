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
    public DbSet<Conversation> Conversations { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<MessageMedia> MessageMedias { get; set; }
    // ❌ Bỏ MessageReadStatuses — dùng IsRead trong Message

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- 1. Post ---
        modelBuilder.Entity<Post>(entity =>
        {
            entity.Property(p => p.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            entity.HasMany(p => p.Likes)
                .WithOne(l => l.Post)
                .HasForeignKey(l => l.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(p => p.Comments)
                .WithOne(c => c.Post)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // --- 2. PostMedia ---
        modelBuilder.Entity<PostMedia>()
            .HasOne(pm => pm.Post)
            .WithMany(p => p.PostMedias)
            .HasForeignKey(pm => pm.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- 3. Like ---
        modelBuilder.Entity<Like>(entity =>
        {
            entity.Property(l => l.Type)
                .HasConversion<int>()
                .IsRequired();

            entity.Property(l => l.Status)
                .HasDefaultValue(1);

            entity.Property(l => l.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(l => l.User)
                .WithMany(u => u.Likes)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // --- 4. Comment ---
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.Property(c => c.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            entity.Property(c => c.Status)
                .HasDefaultValue(1);

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

        // --- 7. Hashtag & Post_Hashtag ---
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

        // --- 8. CommentLike ---
        modelBuilder.Entity<CommentLike>(entity =>
        {
            entity.HasKey(cl => new { cl.CommentId, cl.UserId });

            entity.HasOne(cl => cl.Comment)
                .WithMany(c => c.CommentLikes)
                .HasForeignKey(cl => cl.CommentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(cl => cl.User)
                .WithMany()
                .HasForeignKey(cl => cl.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // --- 9. Notification ---
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.Property(n => n.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(n => n.LastActor)
                .WithMany()
                .HasForeignKey(n => n.LastActorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // --- 10. Conversation ---
        modelBuilder.Entity<Conversation>(entity =>
        {
            // Đảm bảo 2 user chỉ có 1 cuộc hội thoại
            entity.HasIndex(c => new { c.User1Id, c.User2Id }).IsUnique();

            entity.HasOne(c => c.User1)
                .WithMany()
                .HasForeignKey(c => c.User1Id)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.User2)
                .WithMany()
                .HasForeignKey(c => c.User2Id)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(c => c.LastMessageAt); // Tối ưu sort danh sách chat
        });

        // --- 11. Message ---
        modelBuilder.Entity<Message>(entity =>
        {
            entity.Property(m => m.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            entity.Property(m => m.IsRead)
                .HasDefaultValue(false);

            entity.HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Tối ưu query lấy tin nhắn theo thời gian
            entity.HasIndex(m => new { m.ConversationId, m.CreatedAt });
        });

        // --- 12. MessageMedia ---
        modelBuilder.Entity<MessageMedia>(entity =>
        {
            entity.HasOne(mm => mm.Message)
                .WithMany(m => m.Medias)
                .HasForeignKey(mm => mm.MessageId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}