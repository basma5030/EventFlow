using Eventflow.DTOs;

public class EventWithMaterialsDto
{
    public EventDto Event { get; set; }
    public List<MaterialDto> Materials { get; set; } = new();
}