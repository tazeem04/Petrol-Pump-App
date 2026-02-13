using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DipController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DipController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/Dip/history
        // Returns the history of physical dip measurements
        [HttpGet("history")]
public async Task<IActionResult> GetHistory()
{
    var history = await _context.DipLogs
        .OrderByDescending(d => d.CreatedAt)
        .Select(d => new {
            d.Id,
            // Use (double) to prevent the InvalidCastException
            DipMM = (double)d.DipMM, 
            QuantityLiters = (double)d.QuantityLiters,
            Date = d.CreatedAt,
            TankName = _context.Tanks
                        .Where(t => t.Id == d.TankId)
                        .Select(t => t.TankName + " (" + t.FuelType + ")")
                        .FirstOrDefault() ?? "Unknown Tank"
        })
        .ToListAsync();

    return Ok(history);
}

        // 2. POST: api/Dip/save
        // Triggered by React "Manual Dip Entry" Modal
        [HttpPost("save")]
        public async Task<IActionResult> SaveDip([FromBody] DipEntryRequest request)
        {
            try
            {
                if (request == null) return BadRequest("Invalid request.");

                var tank = await _context.Tanks.FindAsync(request.TankId);
                if (tank == null) return NotFound("Target tank not found.");

                var newLog = new DipLog
                {
                    TankId = tank.Id,
                    DipMM = request.DipMM,
                    QuantityLiters = request.QuantityLiters,
                    CreatedAt = DateTime.Now // Explicitly set it here just in case
                };

                _context.DipLogs.Add(newLog);

                // Update the actual tank stock
                tank.CurrentStock = request.QuantityLiters;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Stock Updated Successfully" });
            }
            catch (Exception ex)
            {
                // This will now show the REAL error (e.g., missing column or null reference)
                return StatusCode(500, $"Internal Server Error: {ex.Message} - {ex.InnerException?.Message}");
            }
        }
    }

    // Helper class matching the payload from React
    public class DipEntryRequest
    {
        public int TankId { get; set; } // Matches Number(dipTankId) in React
        public decimal DipMM { get; set; }
        public decimal QuantityLiters { get; set; }
        public string? TankName { get; set; } // Optional metadata
    }
}