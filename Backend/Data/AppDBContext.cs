using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Tables
        public DbSet<Tank> Tanks { get; set; }
        public DbSet<Nozzle> Nozzles { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Rate> Rates { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<DailyClosing> DailyClosings { get; set; }
        public DbSet<StockRefill> StockRefills { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Adding default Tanks
            modelBuilder.Entity<Tank>().HasData(
                new Tank { Id = 1, FuelType = "Petrol", Capacity = 20000, CurrentStock = 10000 },
                new Tank { Id = 2, FuelType = "Diesel", Capacity = 30000, CurrentStock = 15000 },
                new Tank { Id = 3, FuelType = "Mobile Oil", Capacity = 1000, CurrentStock = 500 },
                new Tank { Id = 4, FuelType = "Hi-Octane", Capacity = 5000, CurrentStock = 2000 }
            );

            // Adding default Rates
            modelBuilder.Entity<Rate>().HasData(
                new Rate { Id = 1, FuelType = "Petrol", CurrentPrice = 280, LastUpdated = DateTime.Now },
                new Rate { Id = 2, FuelType = "Diesel", CurrentPrice = 295, LastUpdated = DateTime.Now },
                new Rate { Id = 3, FuelType = "Mobile Oil", CurrentPrice = 600, LastUpdated = DateTime.Now },
                new Rate { Id = 4, FuelType = "Hi-Octane", CurrentPrice = 330, LastUpdated = DateTime.Now }
            );

            // Adding default Machines/Nozzles
            modelBuilder.Entity<Nozzle>().HasData(
                new Nozzle { Id = 1, MachineName = "Machine 1", FuelType = "Petrol", TankId = 1 },
                new Nozzle { Id = 2, MachineName = "Machine 3", FuelType = "Diesel", TankId = 2 },
                new Nozzle { Id = 3, MachineName = "Rack/Shelf", FuelType = "Mobile Oil", TankId = 3 },
                new Nozzle { Id = 4, MachineName = "Machine 2", FuelType = "Hi-Octane", TankId = 4 }
            );
        }
    }
}