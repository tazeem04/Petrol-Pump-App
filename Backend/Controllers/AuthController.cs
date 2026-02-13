using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginRequest)
        {
            if (loginRequest == null || string.IsNullOrEmpty(loginRequest.Username) || string.IsNullOrEmpty(loginRequest.Password))
            {
                return BadRequest(new { message = "Username and Password are required." });
            }

            // Search for user with matching username and password
            var user = await _context.Users.FirstOrDefaultAsync(u => 
                u.Username == loginRequest.Username && 
                u.Password == loginRequest.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Ghalat Username ya Password!" });
            }

            return Ok(new
            {
                user.Username,
                Status = "Success"
            });
        }
    }

    public class LoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}