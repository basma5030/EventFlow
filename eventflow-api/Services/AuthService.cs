using Eventflow.Data;
using Eventflow.Exceptions;
using Eventflow.Models;
using Eventflow.Models.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
namespace Eventflow.DTOs;
public class AuthService
{
    private readonly AppDbContext _db;
    private readonly JwtHelper _jwt;

    public AuthService(AppDbContext db, JwtHelper jwt)
    {
        _db = db;
        _jwt = jwt;
    }
   public async Task<UserDto> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.email))
            throw new ValidationException("Email already in use");
        var user = new User
        {
            Name = dto.username,
            Email = dto.email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.password),
            Role = dto.role,
            IsApproved = dto.role == UserRole.Participant,
            CreatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return MapToDto(user);
    }
    public async Task<string> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users
        .FirstOrDefaultAsync(u => u.Email == dto.email)
        ?? throw new ValidationException("Invalid credentials.");

        if(!BCrypt.Net.BCrypt.Verify
        (dto.password, user.PasswordHash))
        throw new ValidationException("Invalid credentials.");

        if(user.Role == UserRole.Organizer &&
        !user.IsApproved)
            throw new ValidationException("Your account is pending admin approval");

        return _jwt.GenerateToken(user);
    }
    public async Task<UserDto> getCurrentUserAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId)
        ?? throw new NotFoundException("User not found :<");
     return MapToDto(user);
    }

    private UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Name,
            Email = user.Email,
            Role = user.Role.ToString(),
            IsApproved = user.IsApproved,
        };
    }
}