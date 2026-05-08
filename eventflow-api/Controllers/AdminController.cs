using Eventflow.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AdminService _admin;
    public AdminController(AdminService admin)
    {
        _admin = admin;
    }
    
//--------------account management----------------
    [HttpGet("accounts")]
    public async Task<IActionResult> GetAccounts()
    {
        var accounts = await _admin.GetOrganizerAccountsAsync();
        return Ok(accounts);
    }

    [HttpPatch("accounts/{id}/approve")]
    public async Task<IActionResult> ApproveAccount(int id)
    {
        await _admin.ApproveOrganizerAsync(id);
        return Ok(new{ message = "Account approved."});
    }

    [HttpDelete("accounts/{id}/reject")]
    public async Task<IActionResult> RejectAccount(int id)
    {
        await _admin.RejectOrganizerAsync(id);
        return Ok(new { message = "Account rejected and removed." });
    }                                                                

    //--------------event management----------------
    [HttpGet("events/pending")]
    public async Task<IActionResult> GetPendingEvents()
    {
        var events = await _admin.GetPendingEventsAsync();
        return Ok(events);
    }       
    [HttpPatch("events/{id}/approve")]
    public async Task<IActionResult> ApproveEvent(int id)
    {
        await _admin.ApproveEventAsync(id);
        return Ok(new { message = "Event approved"});
    }
    [HttpPatch("events/{id}/reject")]
    public async Task<IActionResult> RejectEvent(int id, [FromBody] RejectEventDto dto )
    {
        await _admin.RejectEventAsync(id, dto.Reason);
        return Ok(new { message = "Event rejected." });

    }     

}