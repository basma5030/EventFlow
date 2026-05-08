using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Eventflow.Models;
using Microsoft.IdentityModel.Tokens;

public class JwtHelper
{
    private readonly IConfiguration configuration;
    public JwtHelper(IConfiguration configuration)
    {
        this.configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var settings = configuration.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding
        .UTF8.GetBytes(settings["Key"]!));
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Role, user.Role.ToString())
    };
    var token = new JwtSecurityToken(
        issuer: settings["Issuer"],
        audience: settings["Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddDays(double
        .Parse(settings["ExpiresInDays"] ?? "1")),
        signingCredentials: new SigningCredentials
        (key, SecurityAlgorithms.HmacSha256)
    );
    return new JwtSecurityTokenHandler().WriteToken(token);

    }
    //helper method to extract user id from httpcontext in controllers
    public static int GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (claim == null)
            throw new UnauthorizedAccessException("User ID not found in token");
        return int.Parse(claim);
    }
}
