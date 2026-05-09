public class MaterialDto
{
    public int Id { get; set; }
    public string FilePath { get; set; }
    public string OriginalName { get; set; }
    public long FileSize { get; set; }
    public string ContentType { get; set; }
    public DateTime UploadedAt { get; set; }
}