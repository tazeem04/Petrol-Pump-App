namespace Backend.Models;

public class Rate
{
    public int Id { get; set; }
    public string FuelType { get; set; } = ""; 
    public decimal CurrentPrice { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.Now;
}