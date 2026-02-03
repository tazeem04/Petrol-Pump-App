using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClosingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClosingController(AppDbContext context)
        {
            _context = context;
        }

        // GET: Form Data (Pichli Readings uthao)
        [HttpGet("formdata")]
        public async Task<IActionResult> GetFormData()
        {
            var nozzles = await _context.Nozzles
                .Include(n => n.Tank)
                .ToListAsync();

            var rates = await _context.Rates.ToListAsync();
            var closingData = new List<object>();

            foreach (var n in nozzles)
            {
                // Is machine ki sab se aakhri entry dhoondo
                var lastClosing = await _context.DailyClosings
                    .Where(c => c.NozzleId == n.Id)
                    .OrderByDescending(c => c.Date) // Sab se nayi date upar
                    .FirstOrDefaultAsync();

                // Agar pehli baar hai to 0, warna pichli Closing ban gayi aaj ki Opening
                decimal openA = lastClosing != null ? lastClosing.ClosingMeter : 0;
                decimal openB = lastClosing != null ? lastClosing.ClosingMeterB : 0; // Note: ClosingMeterB

                var rate = rates.FirstOrDefault(r => r.FuelType == n.FuelType)?.CurrentPrice ?? 0;

                closingData.Add(new
                {
                    nozzleId = n.Id,
                    machineName = n.MachineName,
                    fuelType = n.FuelType,
                    openingMeterA = openA,
                    openingMeterB = openB,
                    currentRate = rate,
                    stock = n.Tank?.CurrentStock ?? 0
                });
            }

            return Ok(closingData);
        }

        // POST: Save Closing
        [HttpPost]
        public async Task<IActionResult> PostClosing(DailyClosing closing)
        {
            // Calculation logic
            decimal saleA = closing.ClosingMeter - closing.OpeningMeter;
            decimal saleB = closing.ClosingMeterB - closing.OpeningMeterB; // Side B logic

            // Check for negative values (Agar user ne ghalat reading likh di)
            if (saleA < 0 || saleB < 0)
            {
                return BadRequest(new { message = "❌ Error: Nayi Reading purani se kam nahi ho sakti!" });
            }

            decimal totalLiters = saleA + saleB;

            // Stock Minus logic
            var nozzle = await _context.Nozzles.Include(n => n.Tank).FirstOrDefaultAsync(n => n.Id == closing.NozzleId);
            if (nozzle != null && nozzle.Tank != null)
            {
                nozzle.Tank.CurrentStock -= totalLiters;
            }

            closing.Date = DateTime.Now;

            _context.DailyClosings.Add(closing);
            await _context.SaveChangesAsync();

            return Ok(new { message = "✅ Closing Saved Successfully!", totalLiters });
        }
    }
}