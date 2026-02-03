using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomersController(AppDbContext context)
    {
        _context = context;
    }

    // 1. Saaray Customers ki list (GET: api/customers)
    [HttpGet]
    public async Task<IActionResult> GetCustomers()
    {
        return Ok(await _context.Customers.ToListAsync());
    }

    // 2. Naya Customer Add karo (POST: api/customers)
    [HttpPost]
    public async Task<IActionResult> AddCustomer(Customer customer)
    {
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return Ok(customer);
    }
}