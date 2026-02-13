using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddNozzleLabels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LabelSideA",
                table: "Nozzles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LabelSideB",
                table: "Nozzles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Nozzles",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "LabelSideA", "LabelSideB" },
                values: new object[] { "Side A", "Side B" });

            migrationBuilder.UpdateData(
                table: "Nozzles",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "LabelSideA", "LabelSideB" },
                values: new object[] { "Side A", "Side B" });

            migrationBuilder.UpdateData(
                table: "Nozzles",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "LabelSideA", "LabelSideB" },
                values: new object[] { "Side A", "Side B" });

            migrationBuilder.UpdateData(
                table: "Nozzles",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "LabelSideA", "LabelSideB" },
                values: new object[] { "Side A", "Side B" });

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LabelSideA",
                table: "Nozzles");

            migrationBuilder.DropColumn(
                name: "LabelSideB",
                table: "Nozzles");

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 9, 10, 25, 2, 839, DateTimeKind.Local).AddTicks(3086));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 2,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 9, 10, 25, 2, 839, DateTimeKind.Local).AddTicks(3090));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 3,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 9, 10, 25, 2, 839, DateTimeKind.Local).AddTicks(3093));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 4,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 9, 10, 25, 2, 839, DateTimeKind.Local).AddTicks(3096));
        }
    }
}
