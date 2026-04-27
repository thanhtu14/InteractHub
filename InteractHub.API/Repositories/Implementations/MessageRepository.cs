using InteractHub.API.Data;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories.Implementations;

public class MessageRepository : IMessageRepository
{
    private readonly AppDbContext _context;

    public MessageRepository(AppDbContext context)
    {
        _context = context;
    }

    // ── Conversation ─────────────────────────────────────────────

    public async Task<Conversation?> GetConversationBetweenUsersAsync(
        string user1Id, string user2Id)
    {
        return await _context.Conversations
            .Include(c => c.User1)
            .Include(c => c.User2)
            .FirstOrDefaultAsync(c =>
                (c.User1Id == user1Id && c.User2Id == user2Id) ||
                (c.User1Id == user2Id && c.User2Id == user1Id));
    }

    public async Task<Conversation?> GetConversationByIdAsync(long conversationId)
    {
        return await _context.Conversations
            .FirstOrDefaultAsync(c => c.Id == conversationId);
    }

    public async Task<Conversation> CreateConversationAsync(Conversation conversation)
    {
        await _context.Conversations.AddAsync(conversation);
        await _context.SaveChangesAsync();

        // Load lại navigation sau khi tạo
        return await _context.Conversations
            .Include(c => c.User1)
            .Include(c => c.User2)
            .FirstAsync(c => c.Id == conversation.Id);
    }

    public async Task<IEnumerable<Conversation>> GetConversationsByUserIdAsync(string userId)
    {
        return await _context.Conversations
            .Include(c => c.User1)
            .Include(c => c.User2)
            .Include(c => c.Messages
                .OrderByDescending(m => m.CreatedAt)
                .Take(1))
            .Where(c => c.User1Id == userId || c.User2Id == userId)
            .OrderByDescending(c => c.LastMessageAt)
            .ToListAsync();
    }

    // ── Message ──────────────────────────────────────────────────

    public async Task<IEnumerable<Message>> GetMessagesByConversationIdAsync(
        long conversationId, int page, int pageSize)
    {
        var messages = await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Medias)
            .Where(m => m.ConversationId == conversationId && !m.IsDeleted)
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Đảo lại để hiển thị từ cũ → mới
        messages.Reverse();
        return messages;
    }

    public async Task<Message> CreateMessageAsync(Message message)
    {
        await _context.Messages.AddAsync(message);
        return message;
    }

    public async Task<Message?> GetMessageByIdAsync(long messageId)
    {
        return await _context.Messages
            .Include(m => m.Medias)
            .FirstOrDefaultAsync(m => m.Id == messageId);
    }

    public async Task<IEnumerable<Message>> GetUnreadMessagesAsync(
        long conversationId, string receiverId)
    {
        return await _context.Messages
            .Where(m =>
                m.ConversationId == conversationId &&
                m.SenderId != receiverId &&
                !m.IsRead)
            .ToListAsync();
    }

    public async Task<int> CountUnreadMessagesAsync(
        long conversationId, string receiverId)
    {
        return await _context.Messages
            .CountAsync(m =>
                m.ConversationId == conversationId &&
                m.SenderId != receiverId &&
                !m.IsRead);
    }

    // ── Persistence ──────────────────────────────────────────────

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}