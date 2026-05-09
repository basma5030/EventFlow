using System.ComponentModel.DataAnnotations;
using Eventflow.Models.Enums;

public class RegisterDto
{
    [Required] public string username { get; set; } = string.Empty;
    [Required, EmailAddress] public string email { get; set; } = string.Empty;
    [Required, MinLength(6)] public string password { get; set; } = string.Empty;
    [Required] public UserRole role { get; set;}
}