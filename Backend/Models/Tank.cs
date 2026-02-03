namespace Backend.Models;

public class Tank
{
    public int Id { get; set; }
    public string FuelType { get; set; } = ""; // Petrol, Diesel, Mobile Oil
    public decimal Capacity { get; set; }
    public decimal CurrentStock { get; set; } // Yahan se stock minus hoga
}