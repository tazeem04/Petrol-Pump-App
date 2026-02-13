namespace Backend.Models;

public class Sale
{
    public int Id { get; set; }
    
    public decimal Quantity { get; set; }         // Liters
    public decimal RateAtSale { get; set; }       // Rate
    public decimal TotalAmount { get; set; }      // Paisay
    public DateTime SaleDate { get; set; } = DateTime.Now;

    // 1. Kis Nozzle se nikla?
    public int NozzleId { get; set; }
    public Nozzle? Nozzle { get; set; }
    //public string RecordedBy { get; set; } = "System";

    // 2. Udhaar Logic
    public bool IsCredit { get; set; } = false;
    
    public int? CustomerId { get; set; } // Cash sale ke liye ye khali hoga
    public Customer? Customer { get; set; }

    // 3. Gari ka number (Har sale par alag)
    public string? VehicleNumber { get; set; } = ""; 
}