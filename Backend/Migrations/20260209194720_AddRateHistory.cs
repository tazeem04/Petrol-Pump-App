using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddRateHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Nozzles",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Nozzles",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Nozzles",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Nozzles",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Tanks",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Tanks",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Tanks",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Tanks",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.CreateTable(
                name: "RateHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FuelType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OldPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NewPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RateHistories", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 10, 0, 47, 18, 255, DateTimeKind.Local).AddTicks(340));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 2,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 10, 0, 47, 18, 255, DateTimeKind.Local).AddTicks(346));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 3,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 10, 0, 47, 18, 255, DateTimeKind.Local).AddTicks(349));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 4,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 10, 0, 47, 18, 255, DateTimeKind.Local).AddTicks(352));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RateHistories");

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 9, 19, 18, 14, 219, DateTimeKind.Local).AddTicks(4472));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 2,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 9, 19, 18, 14, 219, DateTimeKind.Local).AddTicks(4475));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 3,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 9, 19, 18, 14, 219, DateTimeKind.Local).AddTicks(4477));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 4,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 9, 19, 18, 14, 219, DateTimeKind.Local).AddTicks(4479));

            migrationBuilder.InsertData(
                table: "Tanks",
                columns: new[] { "Id", "Capacity", "CurrentStock", "FuelType", "TankName" },
                values: new object[,]
                {
                    { 1, 20000m, 10000m, "Petrol", "" },
                    { 2, 30000m, 15000m, "Diesel", "" },
                    { 3, 1000m, 500m, "Mobile Oil", "" },
                    { 4, 5000m, 2000m, "Hi-Octane", "" }
                });

            migrationBuilder.InsertData(
                table: "Nozzles",
                columns: new[] { "Id", "FuelType", "LabelSideA", "LabelSideB", "MachineName", "TankId" },
                values: new object[,]
                {
                    { 1, "Petrol", "Side A", "Side B", "Machine 1", 1 },
                    { 2, "Diesel", "Side A", "Side B", "Machine 3", 2 },
                    { 3, "Mobile Oil", "Side A", "Side B", "Rack/Shelf", 3 },
                    { 4, "Hi-Octane", "Side A", "Side B", "Machine 2", 4 }
                });
        }
    }
}
