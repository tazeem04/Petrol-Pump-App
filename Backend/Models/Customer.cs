namespace Backend.Models;
public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = ""; 
    public string Phone { get; set; } = "";
    public decimal CurrentBalance { get; set; } = 0; // Positive = Is ne dene hain

    // Parent-Child: Aik customer ki hazaron sales ho sakti hain
    public List<Sale> Sales { get; set; } = new();
}