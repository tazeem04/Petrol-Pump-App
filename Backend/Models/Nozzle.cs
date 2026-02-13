namespace Backend.Models;

public class Nozzle
{
    public int Id { get; set; }
    public string MachineName { get; set; } = ""; // "Machine 1", "Rack"
    public string FuelType { get; set; } = "";
    //public string RecordedBy { get; set; } = "System";
    public string LabelSideA { get; set; } = "Side A";
    public string LabelSideB { get; set; } = "Side B";
    // Tank se direct connection
    public int TankId { get; set; }
    public Tank? Tank { get; set; }
}