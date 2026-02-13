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

        [HttpGet("tanks")]
        public async Task<IActionResult> GetTanks()
        {
            return Ok(await _context.Tanks.ToListAsync());
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetRefillHistory()
        {
            var history = await _context.StockRefills
                .OrderByDescending(s => s.Date)
                .Select(s => new {
                    s.Id,
                    s.TankId,
                    TankName = _context.Tanks.Where(t => t.Id == s.TankId).Select(t => t.TankName).FirstOrDefault(),
                    FuelType = _context.Tanks.Where(t => t.Id == s.TankId).Select(t => t.FuelType).FirstOrDefault(),
                    s.Quantity,
                    s.CostPerLiter,
                    s.TotalCost,
                    s.Date
                })
                .Take(20)
                .ToListAsync();

            return Ok(history);
        }

        // POST: api/Stock/refill
        // CAPACITY IS NOT ASKED HERE; IT IS FETCHED FROM THE TANK TABLE
        [HttpPost("refill")]
        public async Task<IActionResult> RefillStock([FromBody] StockRefill refill)
        {
            if (refill == null || refill.Quantity <= 0)
                return BadRequest(new { message = "Invalid refill data." });

            var tank = await _context.Tanks.FindAsync(refill.TankId);
            if (tank == null) return NotFound(new { message = "Tank not found." });

            // Safety Check: Ensure refill doesn't exceed the set Capacity
            if (tank.Capacity > 0 && (tank.CurrentStock + refill.Quantity) > tank.Capacity)
            {
                return BadRequest(new { message = $"Insufficient capacity! Tank capacity is {tank.Capacity}L." });
            }

            tank.CurrentStock += refill.Quantity;
            refill.Date = DateTime.Now;
            refill.TotalCost = refill.Quantity * refill.CostPerLiter;

            _context.StockRefills.Add(refill);
            await _context.SaveChangesAsync();

            return Ok(new { message = "✅ Stock updated successfully!" });
        }

        [HttpPut("refill/{id}")]
        public async Task<IActionResult> UpdateRefill(int id, [FromBody] StockRefill updatedRefill)
        {
            var existingRefill = await _context.StockRefills.FindAsync(id);
            if (existingRefill == null) return NotFound(new { message = "Record not found." });

            var tank = await _context.Tanks.FindAsync(existingRefill.TankId);
            if (tank == null) return NotFound(new { message = "Associated tank not found." });

            // Reverse old qty and apply new qty to CurrentStock
            tank.CurrentStock = (tank.CurrentStock - existingRefill.Quantity) + updatedRefill.Quantity;

            existingRefill.Quantity = updatedRefill.Quantity;
            existingRefill.CostPerLiter = updatedRefill.CostPerLiter;
            existingRefill.TotalCost = updatedRefill.Quantity * updatedRefill.CostPerLiter;
            existingRefill.Date = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "✅ Refill record updated." });
        }

        // NEW: Method to update Tank Capacity ONLY when Admin wants to
        [HttpPut("tanks/{id}")]
        public async Task<IActionResult> UpdateTank(int id, [FromBody] Tank updatedTank)
        {
            var tank = await _context.Tanks.FindAsync(id);
            if (tank == null) return NotFound();

            tank.TankName = updatedTank.TankName;
            tank.Capacity = updatedTank.Capacity;
            tank.FuelType = updatedTank.FuelType;

            await _context.SaveChangesAsync();
            return Ok(new { message = "✅ Tank configuration updated." });
        }

        [HttpPost("add-tank")]
        public async Task<IActionResult> AddTank([FromBody] Tank tank)
        {
            if (tank == null) return BadRequest();
            _context.Tanks.Add(tank);
            await _context.SaveChangesAsync();
            return Ok(new { message = "✅ Tank initialized.", tank });
        }

        [HttpDelete("refill/{id}")]
        public async Task<IActionResult> DeleteRefill(int id)
        {
            var refill = await _context.StockRefills.FindAsync(id);
            if (refill == null) return NotFound();

            var tank = await _context.Tanks.FindAsync(refill.TankId);
            if (tank != null)
            {
                tank.CurrentStock -= refill.Quantity;
            }

            _context.StockRefills.Remove(refill);
            await _context.SaveChangesAsync();

            return Ok(new { message = "✅ Record removed and stock adjusted." });
        }
    }
}