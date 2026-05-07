namespace Eventflow.Models
{
  using Eventflow.Models.Enums;
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public UserRole Role { get; set; } = UserRole.Participant;
        public DateTime CreatedAt { get; set;}
        public bool IsApproved { get; set; }
    }
    
}