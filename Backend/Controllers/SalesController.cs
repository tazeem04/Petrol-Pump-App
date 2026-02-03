using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SalesController : ControllerBase
{
    private readonly AppDbContext _context;

    public SalesController(AppDbContext context)
    {
        _context = context;
    }

    // 1. React ko Form bharne ke liye Data bhejna (GET: api/sales/formdata)
    [HttpGet("formdata")]
    public async Task<IActionResult> GetFormData()
    {
        var nozzles = await _context.Nozzles.ToListAsync();
        var customers = await _context.Customers.ToListAsync();
        var rates = await _context.Rates.OrderByDescending(r => r.LastUpdated).ToListAsync();

        return Ok(new { nozzles, customers, rates });
    }

    // 2. Nayi Sale Save Karna (POST: api/sales)
    // POST: api/sales
[HttpPost]
public async Task<IActionResult> PostSale(Sale sale)
{
    // 1. Machine (Nozzle) Check karein
    var nozzle = await _context.Nozzles
        .Include(n => n.Tank)
        .FirstOrDefaultAsync(n => n.Id == sale.NozzleId);

    if (nozzle == null) return BadRequest("Machine/Nozzle nahi mili.");

    // 2. Rate Check karein (Rate k baghair Amount nahi ban sakti)
    var rateObj = await _context.Rates
        .FirstOrDefaultAsync(r => r.FuelType == nozzle.FuelType);

    if (rateObj == null) return BadRequest($"Error: {nozzle.FuelType} ka Rate set nahi hai.");

    // 3. Amount Calculate karein (Quantity * Rate)
    // Ye boht zaroori hai taake Total paisay sahi banen
    sale.RateAtSale = rateObj.CurrentPrice;
    sale.TotalAmount = sale.Quantity * sale.RateAtSale;
    sale.SaleDate = DateTime.Now;

    // 4. Stock Minus karein
    if (nozzle.Tank != null)
    {
        nozzle.Tank.CurrentStock -= sale.Quantity;
    }

    // 5. CUSTOMER BALANCE UPDATE (Main Fix)
    if (sale.IsCredit && sale.CustomerId != null)
    {
        var customer = await _context.Customers.FindAsync(sale.CustomerId);
        if (customer != null)
        {
            // Yahan Balance Update ho raha hai
            customer.CurrentBalance += sale.TotalAmount;
            
            // Explicitly batao ke customer update hua hai
            _context.Customers.Update(customer);
        }
        else
        {
            return BadRequest("Customer database mein nahi mila.");
        }
    }

    // 6. Save Everything
    _context.Sales.Add(sale);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Saved & Balance Updated", totalAmount = sale.TotalAmount });
}
    
    // 3. Aaj ki Saari Sales dekhna (Reporting)
    [HttpGet("today")]
    public async Task<IActionResult> GetTodaySales()
    {
        var today = DateTime.Today;
        var sales = await _context.Sales
            .Include(s => s.Nozzle)
            .Include(s => s.Customer)
            .Where(s => s.SaleDate >= today)
            .OrderByDescending(s => s.SaleDate)
            .ToListAsync();

        return Ok(sales);
    }
}