using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TanksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TanksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTankLevels()
    {
        var tanks = await _context.Tanks.ToListAsync();
        return Ok(tanks);
    }

    // --- NEW EDIT FUNCTIONALITY ---
    // Allows updating Tank Name, Fuel Type, or Capacity
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTankConfiguration(int id, [FromBody] Tank updatedTank)
    {
        var tank = await _context.Tanks.FindAsync(id);
        if (tank == null) return NotFound(new { message = "Tank not found." });

        // Update properties
        tank.TankName = updatedTank.TankName;
        tank.FuelType = updatedTank.FuelType;
        tank.Capacity = updatedTank.Capacity;

        // Validation: Ensure new capacity isn't smaller than current stock
        if (tank.Capacity < tank.CurrentStock)
        {
            return BadRequest(new { message = "New capacity cannot be less than current stock levels." });
        }

        _context.Entry(tank).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return BadRequest(new { message = "Concurrency error occurred." });
        }

        return Ok(new { message = "Tank configuration updated successfully.", tank });
    }

    [HttpPut("refill/{id}")]
    public async Task<IActionResult> RefillTank(int id, [FromBody] decimal litersAdded)
    {
        var tank = await _context.Tanks.FindAsync(id);
        if (tank == null) return NotFound();

        if (tank.CurrentStock + litersAdded > tank.Capacity)
            return BadRequest("Tank Overfull ho jaye ga! Itni jagah nahi hai.");

        tank.CurrentStock += litersAdded;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Tank Refilled", newStock = tank.CurrentStock });
    }

    //Delete Request
    [HttpDelete("delete-tank/{id}")]
    public async Task<IActionResult> DeleteTank(int id)
    {
        var tank = await _context.Tanks.FindAsync(id);
        if (tank == null) return NotFound();

        var hasRecords = await _context.StockRefills.AnyAsync(r => r.TankId == id);
        if (hasRecords)
            return BadRequest(new { message = "Empty this tank's refill logs before deleting the tank." });

        _context.Tanks.Remove(tank);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Tank removed successfully." });
    }
    // POST: api/Tanks
    // Used by Admin to initialize a brand new storage tank
    [HttpPost]
    public async Task<IActionResult> CreateTank([FromBody] Tank tank)
    {
        if (tank == null)
        {
            return BadRequest(new { message = "Tank data is required." });
        }

        if (string.IsNullOrEmpty(tank.TankName) || tank.Capacity <= 0)
        {
            return BadRequest(new { message = "Valid Tank Name and Capacity are required." });
        }

        // Ensure CurrentStock starts at 0 for a new tank if not specified
        if (tank.CurrentStock < 0) tank.CurrentStock = 0;

        _context.Tanks.Add(tank);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTankLevels), new { id = tank.Id }, tank);
    }
}