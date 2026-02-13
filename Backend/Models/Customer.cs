namespace Backend.Models;

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = ""; // Name Required hai
    public string? Phone { get; set; } // Optional
    public string? Address { get; set; } // Optional
    public string? ImageUrl { get; set; } // Optional
    public decimal CurrentBalance { get; set; } = 0;
    //public string RecordedBy { get; set; } = "System";
    public List<Sale> Sales { get; set; } = new();
}