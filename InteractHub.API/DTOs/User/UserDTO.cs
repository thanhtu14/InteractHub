namespace InteractHub.API.DTOs.User;

public class UserDto
{
    public string Id { get; set; } = "";

    public string Username { get; set; } = "";

    public string Email { get; set; } = "";
    public string? Phone { get; set; } = "";
    public string? CoverUrl { get; set; }   // ← thêm mới

    public string? ProfilePicture { get; set; }
    public string? Bio { get; set; }

    public DateTime? DateOfBirth { get; set; }
    public DateTime? CreatedAt { get; set; }

    public string? Gender { get; set; }   // ✅ thêm mới
    public List<string> Roles { get; set; } = new();
}







// ✅ DTO riêng cho kết quả tìm kiếm user
public class UserSearchDto
{
    public string Id { get; set; } = "";
    public string Username { get; set; } = "";
    public string? FullName { get; set; }
    public string? ProfilePicture { get; set; }
    public int MutualFriends { get; set; } = 0;
    public string FriendshipStatus { get; set; } = "None"; // 👈 thêm
}


