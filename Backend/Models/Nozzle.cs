namespace Backend.Models;

public class Nozzle
{
    public int Id { get; set; }
    public string MachineName { get; set; } = ""; // "Machine 1", "Rack"
        public string FuelType { get; set; } = "";    
    
    // Tank se direct connection
    public int TankId { get; set; }
    public Tank? Tank { get; set; }
}