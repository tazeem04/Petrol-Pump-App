using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Password { get; set; } = string.Empty;

        //[MaxLength(100)]
        //public string FullName { get; set; } = string.Empty;

        //[MaxLength(20)]
        //public string Role { get; set; } = "Admin";
    }
}