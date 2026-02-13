using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) 
        {
        }

        // --- User Table for Login ---
        public DbSet<User> Users { get; set; }

        public DbSet<Tank> Tanks { get; set; }
        public DbSet<Nozzle> Nozzles { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Rate> Rates { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<DailyClosing> DailyClosings { get; set; }
        public DbSet<StockRefill> StockRefills { get; set; }
        public DbSet<RateHistory> RateHistories { get; set; }
        public DbSet<DipLog> DipLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- Decimal Precision Configuration ---
            modelBuilder.Entity<Tank>().Property(t => t.Capacity).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Tank>().Property(t => t.CurrentStock).HasColumnType("decimal(18,2)");

            modelBuilder.Entity<StockRefill>().Property(s => s.Quantity).HasColumnType("decimal(18,2)");
            
            modelBuilder.Entity<DailyClosing>().Property(d => d.OpeningMeter).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<DailyClosing>().Property(d => d.ClosingMeter).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<DailyClosing>().Property(d => d.OpeningMeterB).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<DailyClosing>().Property(d => d.ClosingMeterB).HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Rate>().Property(r => r.CurrentPrice).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Customer>().Property(c => c.CurrentBalance).HasColumnType("decimal(18,2)");

            // --- Seed Data ---
            modelBuilder.Entity<Rate>().HasData(
                new Rate { Id = 1, FuelType = "Petrol", CurrentPrice = 280, LastUpdated = DateTime.Now },
                new Rate { Id = 2, FuelType = "Diesel", CurrentPrice = 295, LastUpdated = DateTime.Now },
                new Rate { Id = 3, FuelType = "Mobile Oil", CurrentPrice = 600, LastUpdated = DateTime.Now },
                new Rate { Id = 4, FuelType = "Hi-Octane", CurrentPrice = 330, LastUpdated = DateTime.Now }
            );

            // Seed Admin User (Simplified)
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, Username = "admin", Password = "admin123" }
            );
        }
    }
}