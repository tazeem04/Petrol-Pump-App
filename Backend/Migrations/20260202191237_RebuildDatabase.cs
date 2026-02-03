using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class RebuildDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FuelType",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "Liters",
                table: "Sales");

            migrationBuilder.RenameColumn(
                name: "PricePerLiter",
                table: "Sales",
                newName: "RateAtSale");

            migrationBuilder.AddColumn<int>(
                name: "CustomerId",
                table: "Sales",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCredit",
                table: "Sales",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "NozzleId",
                table: "Sales",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "Quantity",
                table: "Sales",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "VehicleNumber",
                table: "Sales",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Rates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FuelType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tanks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FuelType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Capacity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CurrentStock = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tanks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Nozzles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MachineName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FuelType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TankId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nozzles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Nozzles_Tanks_TankId",
                        column: x => x.TankId,
                        principalTable: "Tanks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DailyClosings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NozzleId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OpeningMeter = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ClosingMeter = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OpeningMeterB = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ClosingMeterB = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyClosings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyClosings_Nozzles_NozzleId",
                        column: x => x.NozzleId,
                        principalTable: "Nozzles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Rates",
                columns: new[] { "Id", "CurrentPrice", "FuelType", "LastUpdated" },
                values: new object[,]
                {
                    { 1, 280m, "Petrol", new DateTime(2026, 2, 3, 0, 12, 34, 457, DateTimeKind.Local).AddTicks(8626) },
                    { 2, 295m, "Diesel", new DateTime(2026, 2, 3, 0, 12, 34, 457, DateTimeKind.Local).AddTicks(8629) },
                    { 3, 600m, "Mobile Oil", new DateTime(2026, 2, 3, 0, 12, 34, 457, DateTimeKind.Local).AddTicks(8630) },
                    { 4, 330m, "Hi-Octane", new DateTime(2026, 2, 3, 0, 12, 34, 457, DateTimeKind.Local).AddTicks(8631) }
                });

            migrationBuilder.InsertData(
                table: "Tanks",
                columns: new[] { "Id", "Capacity", "CurrentStock", "FuelType" },
                values: new object[,]
                {
                    { 1, 20000m, 10000m, "Petrol" },
                    { 2, 30000m, 15000m, "Diesel" },
                    { 3, 1000m, 500m, "Mobile Oil" },
                    { 4, 5000m, 2000m, "Hi-Octane" }
                });

            migrationBuilder.InsertData(
                table: "Nozzles",
                columns: new[] { "Id", "FuelType", "MachineName", "TankId" },
                values: new object[,]
                {
                    { 1, "Petrol", "Machine 1", 1 },
                    { 2, "Diesel", "Machine 3", 2 },
                    { 3, "Mobile Oil", "Rack/Shelf", 3 },
                    { 4, "Hi-Octane", "Machine 2", 4 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sales_CustomerId",
                table: "Sales",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Sales_NozzleId",
                table: "Sales",
                column: "NozzleId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyClosings_NozzleId",
                table: "DailyClosings",
                column: "NozzleId");

            migrationBuilder.CreateIndex(
                name: "IX_Nozzles_TankId",
                table: "Nozzles",
                column: "TankId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CustomerId",
                table: "Payments",
                column: "CustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Sales_Customers_CustomerId",
                table: "Sales",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Sales_Nozzles_NozzleId",
                table: "Sales",
                column: "NozzleId",
                principalTable: "Nozzles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sales_Customers_CustomerId",
                table: "Sales");

            migrationBuilder.DropForeignKey(
                name: "FK_Sales_Nozzles_NozzleId",
                table: "Sales");

            migrationBuilder.DropTable(
                name: "DailyClosings");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Rates");

            migrationBuilder.DropTable(
                name: "Nozzles");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "Tanks");

            migrationBuilder.DropIndex(
                name: "IX_Sales_CustomerId",
                table: "Sales");

            migrationBuilder.DropIndex(
                name: "IX_Sales_NozzleId",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "IsCredit",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "NozzleId",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "VehicleNumber",
                table: "Sales");

            migrationBuilder.RenameColumn(
                name: "RateAtSale",
                table: "Sales",
                newName: "PricePerLiter");

            migrationBuilder.AddColumn<string>(
                name: "FuelType",
                table: "Sales",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Liters",
                table: "Sales",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
