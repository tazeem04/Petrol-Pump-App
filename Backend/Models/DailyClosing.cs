namespace Backend.Models
{
    public class DailyClosing
    {
        public int Id { get; set; }
        
        public int NozzleId { get; set; }
        public Nozzle? Nozzle { get; set; }

        public DateTime Date { get; set; }

        // Side A (Main Side)
        public decimal OpeningMeter { get; set; }
        public decimal ClosingMeter { get; set; }

        // Side B (Dusri Side) - NEW
        public decimal OpeningMeterB { get; set; }
        public decimal ClosingMeterB { get; set; }
    }
}