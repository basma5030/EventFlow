using System.ComponentModel.DataAnnotations;

public class RejectEventDto
{
    public int EventId { get; set; }
    [Required]public string Reason { get; set; } = string.Empty;
}