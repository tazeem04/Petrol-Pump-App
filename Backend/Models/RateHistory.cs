using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class RateHistory
    {
        [Key]
        public int Id { get; set; }
        public string FuelType { get; set; } = "";
        public decimal OldPrice { get; set; }
        public decimal NewPrice { get; set; }
        public DateTime Date { get; set; }
        //public string RecordedBy { get; set; } = "System";
    }
}