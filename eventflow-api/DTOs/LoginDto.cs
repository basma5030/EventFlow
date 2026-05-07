using System.ComponentModel.DataAnnotations;

namespace Eventflow.DTOs
{
    public class LoginDto
    {
        [Required]
        public string email { get; set; }

        [Required]
        public string password { get; set; }
    }
}