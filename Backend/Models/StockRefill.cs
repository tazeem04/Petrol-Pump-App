namespace Backend.Models
{
    public class StockRefill
    {
        public int Id { get; set; }
        public int TankId { get; set; }
        public DateTime Date { get; set; }
        public decimal Quantity { get; set; }
        public decimal CostPerLiter { get; set; }
        public decimal TotalCost { get; set; }
    }
}