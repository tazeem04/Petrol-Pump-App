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

    // 1. Form Data (Nozzles, Customers, Rates)
    [HttpGet("formdata")]
    public async Task<IActionResult> GetFormData()
    {
        var nozzles = await _context.Nozzles.ToListAsync();
        var customers = await _context.Customers.ToListAsync();
        var rates = await _context.Rates.OrderByDescending(r => r.LastUpdated).ToListAsync();

        return Ok(new { nozzles, customers, rates });
    }

    // 2. Recent Sales for Table
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecentSales()
    {
        var sales = await _context.Sales
            .Include(s => s.Nozzle)
            .Include(s => s.Customer)
            .OrderByDescending(s => s.Id)
            .Take(10)
            .ToListAsync();

        return Ok(sales);
    }

    // 3. Post Sale 
    [HttpPost]
    public async Task<IActionResult> PostSale(Sale sale)
    {
        var nozzle = await _context.Nozzles
            .Include(n => n.Tank)
            .FirstOrDefaultAsync(n => n.Id == sale.NozzleId);

        if (nozzle == null) return BadRequest("Machine/Nozzle nahi mili.");

        var rateObj = await _context.Rates
            .FirstOrDefaultAsync(r => r.FuelType == nozzle.FuelType);

        if (rateObj == null) return BadRequest($"Error: {nozzle.FuelType} ka Rate set nahi hai.");

        sale.RateAtSale = rateObj.CurrentPrice;
        sale.TotalAmount = sale.Quantity * sale.RateAtSale;
        sale.SaleDate = DateTime.Now;

        // Stock Minus
        if (nozzle.Tank != null) nozzle.Tank.CurrentStock -= sale.Quantity;

        // Customer Balance Update
        if (sale.IsCredit && sale.CustomerId != null)
        {
            var customer = await _context.Customers.FindAsync(sale.CustomerId);
            if (customer != null)
            {
                customer.CurrentBalance += sale.TotalAmount;
                _context.Customers.Update(customer);
            }
        }

        _context.Sales.Add(sale);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Saved & Balance Updated", totalAmount = sale.TotalAmount });
    }

    // 4. Update Sale (PUT) 
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSale(int id, Sale updatedSale)
    {
        var existingSale = await _context.Sales.FindAsync(id);
        if (existingSale == null) return NotFound();

        // A. Reverse Old Balance and Stock
        var customer = await _context.Customers.FindAsync(existingSale.CustomerId);
        if (customer != null) customer.CurrentBalance -= existingSale.TotalAmount;

        var oldNozzle = await _context.Nozzles.Include(n => n.Tank).FirstOrDefaultAsync(n => n.Id == existingSale.NozzleId);
        if (oldNozzle?.Tank != null) oldNozzle.Tank.CurrentStock += existingSale.Quantity;

        // B. Apply New Values
        existingSale.Quantity = updatedSale.Quantity;
        existingSale.TotalAmount = updatedSale.TotalAmount;
        existingSale.VehicleNumber = updatedSale.VehicleNumber;
        existingSale.NozzleId = updatedSale.NozzleId;

        // C. Apply New Balance and Stock
        if (customer != null) customer.CurrentBalance += updatedSale.TotalAmount;

        var newNozzle = await _context.Nozzles.Include(n => n.Tank).FirstOrDefaultAsync(n => n.Id == updatedSale.NozzleId);
        if (newNozzle?.Tank != null) newNozzle.Tank.CurrentStock -= updatedSale.Quantity;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Update Successful" });
    }

    // 5. Delete Sale
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSale(int id)
    {
        var sale = await _context.Sales.FindAsync(id);
        if (sale == null) return NotFound();

        if (sale.IsCredit && sale.CustomerId != null)
        {
            var customer = await _context.Customers.FindAsync(sale.CustomerId);
            if (customer != null)
            {
                customer.CurrentBalance -= sale.TotalAmount;
                _context.Customers.Update(customer);
            }
        }

        var nozzle = await _context.Nozzles.Include(n => n.Tank).FirstOrDefaultAsync(n => n.Id == sale.NozzleId);
        if (nozzle?.Tank != null) nozzle.Tank.CurrentStock += sale.Quantity;

        _context.Sales.Remove(sale);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Deleted" });
    }
}