using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RatesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/rates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rate>>> GetRates()
        {
            return await _context.Rates.ToListAsync();
        }

        // POST: api/rates/update
        [HttpPost("update")]
        public async Task<IActionResult> UpdateRates([FromBody] List<Rate> updatedRates)
        {
            if (updatedRates == null || !updatedRates.Any())
                return BadRequest("No rates provided.");

            foreach (var incomingRate in updatedRates)
            {
                var existingRate = await _context.Rates.FindAsync(incomingRate.Id);
                
                if (existingRate != null && existingRate.CurrentPrice != incomingRate.CurrentPrice)
                {
                    // Create history log for the change
                    _context.RateHistories.Add(new RateHistory
                    {
                        FuelType = existingRate.FuelType,
                        OldPrice = existingRate.CurrentPrice,
                        NewPrice = incomingRate.CurrentPrice,
                        Date = DateTime.Now
                    });

                    // Update main record
                    existingRate.CurrentPrice = incomingRate.CurrentPrice;
                    existingRate.LastUpdated = DateTime.Now;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "✅ Rates updated and history logged successfully." });
        }

        // GET: api/rates/history
        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<RateHistory>>> GetHistory()
        {
            return await _context.RateHistories
                .OrderByDescending(h => h.Date)
                .Take(50)
                .ToListAsync();
        }

        // DELETE: api/rates/history/5
        [HttpDelete("history/{id}")]
        public async Task<IActionResult> DeleteHistory(int id)
        {
            var record = await _context.RateHistories.FindAsync(id);
            if (record == null) 
                return NotFound(new { message = "History record not found." });

            _context.RateHistories.Remove(record);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "✅ Record deleted successfully." });
        }
    }
}