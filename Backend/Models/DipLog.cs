using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class DipLog
    {
        [Key]
        public int Id { get; set; }

        // Foreign Key: Links this dip to a specific Tank
        [ForeignKey("Tank")]
        public int TankId { get; set; }

        public decimal DipMM { get; set; }       // The height in mm (e.g., 1450)
        public decimal QuantityLiters { get; set; } // The resulting fuel (e.g., 18500)
        //public string RecordedBy { get; set; } = "System";
        public DateTime CreatedAt { get; set; } = DateTime.Now; // When it was measured

    }
}