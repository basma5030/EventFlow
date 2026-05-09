using Eventflow.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventflow.Controllers
{
    [ApiController]
    [Route("api/events")]
    public class EventController : ControllerBase
    {
        private readonly EventService _service;

        public EventController(EventService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Roles = "Organizer")]
        public async Task<IActionResult> CreateEvent(CreateEventDto dto)
        {
            var uid = JwtHelper.GetUserId(User);
            var result = await _service.CreateEventAsync(uid, dto);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Organizer")]
        public async Task<IActionResult> UpdateEvent(int id, CreateEventDto dto)
        {
            var userId = JwtHelper.GetUserId(User);
            var result = await _service.UpdateEventAsync(id, userId, dto);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Organizer")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var userId = JwtHelper.GetUserId(User);
            await _service.DeleteEventAsync(id, userId);
            return Ok(new { message = "Deleted" });
        }

        [HttpGet]
        public async Task<IActionResult> GetApprovedEvents()
        {
            var data = await _service.GetApprovedEventsAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventById(int id)
        {
            var eventData = await _service.GetEventByIdAsync(id);
            
            if (eventData == null)
                return NotFound(new { message = "Event not found" });
            
            return Ok(eventData);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchEvents(
            [FromQuery] string? venue,
            [FromQuery] string? category,
            [FromQuery] DateTime? date)
        {
            var data = await _service.SearchEventsAsync(venue, category, date);
            return Ok(data);
        }

        [HttpGet("my")]
        [Authorize(Roles = "Organizer")]
        public async Task<IActionResult> MyEvents()
        {
            var uid = JwtHelper.GetUserId(User);
            var events = await _service.getOrganizerEventsAsync(uid);
            return Ok(events);
        }

        [HttpPost("{id}/upload")]
        [Authorize(Roles = "Organizer")]
        public async Task<IActionResult> UploadEventFiles(int id, IFormFile? image, IFormFile? attachment)
        {
            var userId = JwtHelper.GetUserId(User);

            if (image == null && attachment == null)
            {
                return BadRequest(new { message = "At least one file (image or attachment) is required" });
            }

            try
            {
                var result = await _service.UploadEventFilesAsync(userId, id, image!, attachment!);
                return Ok(new { message = "Files uploaded successfully", eventData = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/upload-material")]
        [Authorize(Roles = "Organizer")]
        public async Task<IActionResult> UploadMaterial(int id, IFormFile attachment)
        {
            var userId = JwtHelper.GetUserId(User);

            if (attachment == null)
            {
                return BadRequest(new { message = "File is required" });
            }

            try
            {
                var result = await _service.UploadSingleMaterialAsync(userId, id, attachment);
                return Ok(new { message = "Material uploaded successfully", material = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{eventId}/materials/{materialId}")]
        [Authorize(Roles = "Organizer")]
        public async Task<IActionResult> DeleteMaterial(int eventId, int materialId)
        {
            var userId = JwtHelper.GetUserId(User);
            
            try
            {
                await _service.DeleteMaterialAsync(userId, eventId, materialId);
                return Ok(new { message = "Material deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/with-materials")]
        public async Task<IActionResult> GetEventWithMaterials(int id)
        {
            var eventData = await _service.GetEventWithMaterialsAsync(id);
            
            if (eventData == null)
                return NotFound(new { message = "Event not found" });
            
            return Ok(eventData);
        }
    }
}