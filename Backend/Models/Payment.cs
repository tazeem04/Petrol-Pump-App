namespace Backend.Models;

public class Payment
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.Now;
    
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
}