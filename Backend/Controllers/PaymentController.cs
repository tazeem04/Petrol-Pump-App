using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PaymentsController(AppDbContext context)
    {
        _context = context;
    }

    // Payment Receive karo (POST: api/payments)
    [HttpPost]
    public async Task<IActionResult> ReceivePayment(Payment payment)
    {
        // 1. Customer dhoondo
        var customer = await _context.Customers.FindAsync(payment.CustomerId);
        if (customer == null) return BadRequest("Customer nahi mila");

        // 2. Balance Kam karo (Recovery)
        customer.CurrentBalance -= payment.Amount;

        // 3. Payment Record save karo
        payment.PaymentDate = DateTime.Now;
        _context.Payments.Add(payment);
        
        await _context.SaveChangesAsync();
        return Ok(new { message = "Payment Received", newBalance = customer.CurrentBalance });
    }
    
    // Kisi Customer ki History dekhna (GET: api/payments/customer/1)
    [HttpGet("customer/{id}")]
    public async Task<IActionResult> GetCustomerHistory(int id)
    {
        var payments = await _context.Payments
            .Where(p => p.CustomerId == id)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync();
        return Ok(payments);
    }
}