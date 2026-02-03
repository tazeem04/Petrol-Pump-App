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

    // Stock Level Check karo (GET: api/tanks)
    [HttpGet]
    public async Task<IActionResult> GetTankLevels()
    {
        var tanks = await _context.Tanks.ToListAsync();
        return Ok(tanks);
    }

    // (Optional) Agar kabhi tank mein naya petrol dalwana ho (Refill)
    // PUT: api/tanks/refill/1
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
}