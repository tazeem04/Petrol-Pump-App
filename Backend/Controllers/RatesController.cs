using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RatesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RatesController(AppDbContext context)
    {
        _context = context;
    }

    // 1. Saaray Rates dekho (GET: api/rates)
    [HttpGet]
    public async Task<IActionResult> GetRates()
    {
        return Ok(await _context.Rates.ToListAsync());
    }

    // 2. Rate Change karo (PUT: api/rates/1)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRate(int id, Rate updatedRate)
    {
        var rate = await _context.Rates.FindAsync(id);
        if (rate == null) return NotFound();

        // Sirf Price aur Date update hogi
        rate.CurrentPrice = updatedRate.CurrentPrice;
        rate.LastUpdated = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(rate);
    }
}