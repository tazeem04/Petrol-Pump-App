using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context) { _context = context; }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var today = DateTime.Today;
            var yesterday = today.AddDays(-1);

            // --- 1. Fetch Today's Data ---
            var todaySalesQuery = _context.Sales.Where(s => s.SaleDate >= today);
            var totalRevenue = await todaySalesQuery.SumAsync(s => s.TotalAmount);
            var totalLiters = await todaySalesQuery.SumAsync(s => s.Quantity);

            // --- 2. Fetch Yesterday's Data ---
            var yesterdaySalesQuery = _context.Sales.Where(s => s.SaleDate >= yesterday && s.SaleDate < today);
            var yesterdayRevenue = await yesterdaySalesQuery.SumAsync(s => s.TotalAmount);
            var yesterdayLiters = await yesterdaySalesQuery.SumAsync(s => s.Quantity);

            // --- 3. Calculate Trends (Percentage Change) ---
            
            // A. Revenue Trend
            string revenueTrend = CalculateTrend(totalRevenue, yesterdayRevenue);
            string revenueColor = GetTrendColor(totalRevenue, yesterdayRevenue);

            // B. Liters Trend (NEW CODE)
            string litersTrend = CalculateTrend(totalLiters, yesterdayLiters);
            string litersColor = GetTrendColor(totalLiters, yesterdayLiters);

            // --- 4. Other Stats ---
            var totalReceivables = await _context.Customers.SumAsync(c => c.CurrentBalance);
            var todayRecovery = await _context.Payments.Where(p => p.PaymentDate >= today).SumAsync(p => p.Amount);
            var stockStatus = await _context.Tanks.Select(t => new { t.FuelType, t.CurrentStock, t.Capacity }).ToListAsync();

            // --- 5. Graph Data ---
            var rawGraphData = await todaySalesQuery
                .GroupBy(s => s.SaleDate.Hour)
                .Select(g => new { Hour = g.Key, Total = g.Sum(s => s.TotalAmount) })
                .OrderBy(x => x.Hour)
                .ToListAsync();

            var graphData = rawGraphData.Select(x => new 
            {
                name = DateTime.Today.AddHours(x.Hour).ToString("h tt", CultureInfo.InvariantCulture),
                sale = x.Total
            }).ToList();

            // --- 6. Recent Sales ---
            var recentSales = await _context.Sales
                .Include(s => s.Customer)
                .Include(s => s.Nozzle)
                .OrderByDescending(s => s.SaleDate)
                .Take(5)
                .Select(s => new {
                    Customer = s.Customer != null ? s.Customer.Name : "Cash Sale",
                    Desc = s.Nozzle != null ? $"{s.Nozzle.FuelType} - {s.Quantity}L" : "Unknown",
                    Time = s.SaleDate.ToString("hh:mm tt"),
                    Amount = s.TotalAmount
                })
                .ToListAsync();

            return Ok(new
            {
                totalReceivables,
                todayRecovery,
                stockStatus,
                recentSales,
                graphData,
                
                // Revenue Data
                totalRevenue,
                revenueTrend, 
                revenueColor,

                // Liters Data (NEW)
                totalLiters,
                litersTrend,
                litersColor
            });
        }

        // --- Helper Function for Calculation ---
        private string CalculateTrend(decimal current, decimal previous)
        {
            if (previous == 0) return current > 0 ? "+100% from yesterday" : "No Change";
            var change = ((current - previous) / previous) * 100;
            return change >= 0 ? $"+{change:F1}% from yesterday" : $"{change:F1}% from yesterday";
        }

        private string GetTrendColor(decimal current, decimal previous)
        {
            if (previous == 0) return current > 0 ? "green" : "gray";
            return current >= previous ? "green" : "red";
        }
    }
}