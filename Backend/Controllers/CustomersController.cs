using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public CustomersController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetCustomers()
        {
            return Ok(await _context.Customers.ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();
            return Ok(customer);
        }

        [HttpPost]
        public async Task<IActionResult> AddCustomer([FromForm] CustomerUploadDTO dto)
        {
            // Sirf Name check hoga, baqi sab optional
            if (string.IsNullOrEmpty(dto.Name)) return BadRequest("Name is required");

            string imageUrl = "";

            if (dto.ImageFile != null)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.ImageFile.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageFile.CopyToAsync(stream);
                }
                imageUrl = "uploads/" + fileName;
            }

            var customer = new Customer
            {
                Name = dto.Name,
                // ?? "" ka matlab hai agar null hai to khali string save karo
                Phone = dto.Phone ?? "", 
                Address = dto.Address ?? "",
                ImageUrl = imageUrl,
                CurrentBalance = 0
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return Ok(customer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromForm] CustomerUploadDTO dto)
        {
            var existing = await _context.Customers.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = dto.Name;
            existing.Phone = dto.Phone ?? "";
            existing.Address = dto.Address ?? "";

            if (dto.ImageFile != null)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.ImageFile.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageFile.CopyToAsync(stream);
                }
                existing.ImageUrl = "uploads/" + fileName;
            }

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Customer deleted successfully" });
        }
    }

    // --- DTO CLASS (Fields ko Optional bana diya hai) ---
    public class CustomerUploadDTO
    {
        public string Name { get; set; } = ""; // Required
        public string? Phone { get; set; }     // Optional (?)
        public string? Address { get; set; }   // Optional (?)
        public IFormFile? ImageFile { get; set; }
    }
}