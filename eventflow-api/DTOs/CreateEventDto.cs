using System.ComponentModel.DataAnnotations;

public class CreateEventDto
{
    [Required] public string title { get; set; }
    [Required] public string description { get; set; }
    [Required] public string venue { get; set; }
    [Required] public string category {get; set;}
    [Required]
    [FutureDate]
    public DateTime eventDate { get; set; }
    public String image { get; set; }
    public String attachment { get; set; }
    [Range(0, double.MaxValue)] public double ticketPrice { get; set; }
    [Range(1, int.MaxValue)] public int totalTickets { get; set; }
}
