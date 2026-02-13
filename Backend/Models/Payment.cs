namespace Backend.Models;

public class Payment
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.Now;
    
    // --- NAYI PROPERTY YAHAN ADD KI HAI ---
    public string Description { get; set; } = "Cash Received"; 
    //public string RecordedBy { get; set; } = "System";
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
}