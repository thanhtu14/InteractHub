namespace InteractHub.API.DTOs.Hashtag;

public class HashtagResponseDto
{
    public int Id { get; set; }
    public string Tag { get; set; } = null!;
}
public class HashtagCreateDto
{
        public string Tag { get; set; } = null!;

}