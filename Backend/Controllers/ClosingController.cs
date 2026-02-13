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

        [HttpGet]
        public async Task<IActionResult> GetAllHistory()
        {
            var history = await _context.DailyClosings
                .OrderByDescending(c => c.Date)
                .ToListAsync();
            return Ok(history);
        }

        [HttpGet("formdata")]
        public async Task<IActionResult> GetFormData()
        {
            var data = await _context.Nozzles
                .Include(n => n.Tank)
                .Select(n => new
                {
                    NozzleId = n.Id,
                    MachineName = n.MachineName,
                    FuelType = n.FuelType,
                    CurrentRate = _context.Rates
                                    .Where(r => r.FuelType == n.FuelType)
                                    .Select(r => r.CurrentPrice)
                                    .FirstOrDefault(),
                    LabelSideA = n.LabelSideA,
                    LabelSideB = n.LabelSideB,
                    CurrentStock = n.Tank != null ? n.Tank.CurrentStock : 0,
                    // Logic to get last closing as today's opening
                    OpeningMeterA = _context.DailyClosings
                                    .Where(c => c.NozzleId == n.Id)
                                    .OrderByDescending(c => c.Date)
                                    .Select(c => (decimal?)c.ClosingMeter)
                                    .FirstOrDefault() ?? 0,
                    OpeningMeterB = _context.DailyClosings
                                    .Where(c => c.NozzleId == n.Id)
                                    .OrderByDescending(c => c.Date)
                                    .Select(c => (decimal?)c.ClosingMeterB)
                                    .FirstOrDefault() ?? 0
                }).ToListAsync();

            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> PostClosing(DailyClosing closing)
        {
            // Same Reading Block (Security for API)
            if (closing.ClosingMeter == closing.OpeningMeter && closing.ClosingMeterB == closing.OpeningMeterB)
            {
                return BadRequest(new { message = "⚠️ Error: Same readings cannot be saved!" });
            }

            decimal saleA = closing.ClosingMeter - closing.OpeningMeter;
            decimal saleB = closing.ClosingMeterB - closing.OpeningMeterB;

            if (saleA < 0 || saleB < 0)
            {
                return BadRequest(new { message = "❌ Error: Nayi Reading purani se kam nahi ho sakti!" });
            }

            // --- UPSERT LOGIC (Update or Insert) ---
            var existingRecord = await _context.DailyClosings.FindAsync(closing.Id);

            if (existingRecord != null)
            {
                // Agar Edit mode hai (ID match kar gayi), toh purana update karo
                existingRecord.ClosingMeter = closing.ClosingMeter;
                existingRecord.ClosingMeterB = closing.ClosingMeterB;
                existingRecord.Date = DateTime.Now;
                _context.DailyClosings.Update(existingRecord);
            }
            else
            {
                // Agar Nayi entry hai, toh stock kam karo aur add karo
                decimal totalLiters = saleA + saleB;
                var nozzle = await _context.Nozzles.Include(n => n.Tank).FirstOrDefaultAsync(n => n.Id == closing.NozzleId);

                if (nozzle != null && nozzle.Tank != null)
                {
                    nozzle.Tank.CurrentStock -= totalLiters;
                }

                closing.Date = DateTime.Now;
                _context.DailyClosings.Add(closing);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "✅ Success!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var record = await _context.DailyClosings.FindAsync(id);
            if (record == null) return NotFound();

            _context.DailyClosings.Remove(record);
            await _context.SaveChangesAsync();
            return Ok(new { message = "🗑️ Record Deleted Successfully!" });
        }
    }
}