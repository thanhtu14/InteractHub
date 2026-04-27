using InteractHub.API.Entities;

namespace InteractHub.API.Repositories.Interfaces;

public interface IMessageRepository
{
    // ── Conversation ─────────────────────────────────────────────
    Task<Conversation?> GetConversationBetweenUsersAsync(string user1Id, string user2Id);
    Task<Conversation?> GetConversationByIdAsync(long conversationId);
    Task<Conversation> CreateConversationAsync(Conversation conversation);
    Task<IEnumerable<Conversation>> GetConversationsByUserIdAsync(string userId);

    // ── Message ──────────────────────────────────────────────────
    Task<IEnumerable<Message>> GetMessagesByConversationIdAsync(
        long conversationId, int page, int pageSize);
    Task<Message> CreateMessageAsync(Message message);
    Task<Message?> GetMessageByIdAsync(long messageId);
    Task<IEnumerable<Message>> GetUnreadMessagesAsync(long conversationId, string receiverId);
    Task<int> CountUnreadMessagesAsync(long conversationId, string receiverId);

    // ── Persistence ──────────────────────────────────────────────
    Task SaveChangesAsync();
}