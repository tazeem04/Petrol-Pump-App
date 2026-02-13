using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("ledger/{customerId}")]
        public async Task<IActionResult> GetLedger(int customerId)
        {
            var sales = await _context.Sales
                .Where(s => s.CustomerId == customerId)
                .Select(s => new {
                    Id = s.Id, // ID lazmi bhejni hai
                    Date = s.SaleDate,
                    Description = "Fuel Sale (" + s.VehicleNumber + ")", 
                    Debit = s.TotalAmount,
                    Credit = 0.0m,
                    Type = "Sale",
                    NozzleId = s.NozzleId,
                    VehicleNumber = s.VehicleNumber,
                    Quantity = s.Quantity,
                    CustomerId = s.CustomerId
                }).ToListAsync();

            var payments = await _context.Payments
                .Where(p => p.CustomerId == customerId)
                .Select(p => new {
                    Id = p.Id,
                    Date = p.PaymentDate,
                    Description = !string.IsNullOrEmpty(p.Description) ? p.Description : "Cash Received",
                    Debit = 0.0m,
                    Credit = p.Amount,
                    Type = "Payment"
                }).ToListAsync();

            var ledger = sales.Cast<object>().Concat(payments.Cast<object>())
                .OrderBy(x => ((dynamic)x).Date)
                .ToList();

            if (ledger.Count == 0) return Ok(new List<object>());

            return Ok(ledger);
        }

        [HttpGet("dashboard-summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var totalSales = await _context.Sales.AnyAsync() ? await _context.Sales.SumAsync(s => s.TotalAmount) : 0;
            var totalPayments = await _context.Payments.AnyAsync() ? await _context.Payments.SumAsync(p => p.Amount) : 0;
            var totalCustomers = await _context.Customers.CountAsync();

            return Ok(new {
                totalSales,
                totalPayments,
                totalReceivable = totalSales - totalPayments,
                totalCustomers
            });
        }
    }
}