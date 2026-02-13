using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/payment/customers
        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomers()
        {
            var customers = await _context.Customers
                .Select(c => new { c.Id, c.Name, c.CurrentBalance })
                .ToListAsync();
            return Ok(customers);
        }

        // GET: api/payment/recent
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.Customer)
                .OrderByDescending(p => p.Id)
                .Take(10)
                .ToListAsync();
            return Ok(payments);
        }

        // POST: api/payment (New Entry)
        [HttpPost]
        public async Task<IActionResult> PostPayment([FromBody] Payment payment)
        {
            if (payment.Amount <= 0)
                return BadRequest(new { message = "Amount zero se zyada honi chahiye" });

            var customer = await _context.Customers.FindAsync(payment.CustomerId);
            if (customer == null) return NotFound(new { message = "Customer nahi mila" });

            customer.CurrentBalance -= payment.Amount;

            if (payment.PaymentDate == default) payment.PaymentDate = DateTime.Now;

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "✅ Payment Received Successfully!", newBalance = customer.CurrentBalance });
        }

        // PUT: api/payment/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePayment(int id, [FromBody] Payment updatedPayment)
        {
            var existingPayment = await _context.Payments.FindAsync(id);
            if (existingPayment == null) return NotFound();

            var customer = await _context.Customers.FindAsync(existingPayment.CustomerId);
            if (customer != null)
            {
                customer.CurrentBalance = (customer.CurrentBalance + existingPayment.Amount) - updatedPayment.Amount;
            }

            existingPayment.Amount = updatedPayment.Amount;
            existingPayment.Description = updatedPayment.Description;
            existingPayment.PaymentDate = updatedPayment.PaymentDate;

            await _context.SaveChangesAsync();
            return Ok(new { message = "✅ Payment Updated Successfully!" });
        }

        // DELETE: api/payment/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null) return NotFound();

            var customer = await _context.Customers.FindAsync(payment.CustomerId);
            if (customer != null) customer.CurrentBalance += payment.Amount;

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "✅ Payment Deleted & Balance Adjusted!" });
        }
    }
}