public class FileHelper
{
    private readonly IWebHostEnvironment _env;

    public FileHelper(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveFileAsync(IFormFile file, int eventId)
    {
        if (file == null || file.Length == 0)
            throw new Exception("Invalid file.");

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf" };

        var ext = Path.GetExtension(file.FileName).ToLower();

        if (!allowedExtensions.Contains(ext))
            throw new Exception("Invalid file type.");

        var folder = Path.Combine(_env.WebRootPath, "uploads", "events", eventId.ToString());
        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(folder, fileName);

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/uploads/events/{eventId}/{fileName}";
    }
}