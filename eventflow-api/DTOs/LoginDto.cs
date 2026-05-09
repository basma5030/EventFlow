using System.ComponentModel.DataAnnotations;

namespace Eventflow.DTOs
{
    public class LoginDto
    {
        [Required]
        public string email { get; set; } = string.Empty;

        [Required]
        public string password { get; set; } = string.Empty;

    }
}