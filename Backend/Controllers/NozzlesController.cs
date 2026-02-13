using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NozzlesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NozzlesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Nozzles
        [HttpGet]
        public async Task<IActionResult> GetNozzles()
        {
            // We include the Tank info so we know which nozzle belongs to which tank
            var nozzles = await _context.Nozzles.Include(n => n.Tank).ToListAsync();
            return Ok(nozzles);
        }
        //Put Request
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNozzle(int id, [FromBody] Nozzle nozzle)
        {
            var existingNozzle = await _context.Nozzles.FindAsync(id);
            if (existingNozzle == null) return NotFound();

            existingNozzle.MachineName = nozzle.MachineName;
            existingNozzle.FuelType = nozzle.FuelType;
            existingNozzle.TankId = nozzle.TankId;
            existingNozzle.LabelSideA = nozzle.LabelSideA;
            existingNozzle.LabelSideB = nozzle.LabelSideB;

            await _context.SaveChangesAsync();
            return Ok(new { message = "✅ Machine Config Updated" });
        }
        // POST: api/Nozzles
        [HttpPost]
        public async Task<IActionResult> AddNozzle([FromBody] Nozzle nozzle)
        {
            if (nozzle == null) return BadRequest();

            // Check if the TankId provided by the Admin actually exists
            var tankExists = await _context.Tanks.AnyAsync(t => t.Id == nozzle.TankId);
            if (!tankExists) return BadRequest(new { message = "Selected Tank does not exist." });

            _context.Nozzles.Add(nozzle);
            await _context.SaveChangesAsync();

            return Ok(new { message = "✅ Nozzle created and linked to tank successfully!" });
        }

        // DELETE: api/Nozzles/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNozzle(int id)
        {
            var nozzle = await _context.Nozzles.FindAsync(id);
            if (nozzle == null) return NotFound();

            _context.Nozzles.Remove(nozzle);
            await _context.SaveChangesAsync();
            return Ok(new { message = "✅ Nozzle removed." });
        }
    }
}