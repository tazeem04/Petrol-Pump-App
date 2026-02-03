using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StockController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StockController(AppDbContext context)
        {
            _context = context;
        }

        // GET: Tanks list (Stock add karne k liye)
        [HttpGet("tanks")]
        public async Task<IActionResult> GetTanks()
        {
            return Ok(await _context.Tanks.ToListAsync());
        }

        // POST: Tanker Aaya (Stock Refill)
        [HttpPost("refill")]
        public async Task<IActionResult> RefillStock(StockRefill refill)
        {
            var tank = await _context.Tanks.FindAsync(refill.TankId);
            if (tank == null) return NotFound("Tank nahi mila");

            // 1. Stock Barhao
            tank.CurrentStock += refill.Quantity;
            
            // 2. Entry Save karo
            refill.Date = DateTime.Now;
            refill.TotalCost = refill.Quantity * refill.CostPerLiter;
            
            _context.StockRefills.Add(refill);
            await _context.SaveChangesAsync();

            return Ok(new { message = "✅ Stock Updated!", newStock = tank.CurrentStock });
        }
    }
}