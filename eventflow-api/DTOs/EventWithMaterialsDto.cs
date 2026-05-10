using Eventflow.DTOs;

public class EventWithMaterialsDto
{
    public EventDto Event { get; set; }= new EventDto();
    public List<MaterialDto> Materials { get; set; } = new();
}