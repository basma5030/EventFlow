public class MaterialDto
{
    public int Id { get; set; }
    public string FilePath { get; set; } = string.Empty;
public string OriginalName { get; set; } = string.Empty;
public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    
    public DateTime UploadedAt { get; set; }
}