using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTankNameColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TankName",
                table: "Tanks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

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

            migrationBuilder.UpdateData(
                table: "Tanks",
                keyColumn: "Id",
                keyValue: 1,
                column: "TankName",
                value: "");

            migrationBuilder.UpdateData(
                table: "Tanks",
                keyColumn: "Id",
                keyValue: 2,
                column: "TankName",
                value: "");

            migrationBuilder.UpdateData(
                table: "Tanks",
                keyColumn: "Id",
                keyValue: 3,
                column: "TankName",
                value: "");

            migrationBuilder.UpdateData(
                table: "Tanks",
                keyColumn: "Id",
                keyValue: 4,
                column: "TankName",
                value: "");

            migrationBuilder.CreateIndex(
                name: "IX_StockRefills_TankId",
                table: "StockRefills",
                column: "TankId");

            migrationBuilder.AddForeignKey(
                name: "FK_StockRefills_Tanks_TankId",
                table: "StockRefills",
                column: "TankId",
                principalTable: "Tanks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockRefills_Tanks_TankId",
                table: "StockRefills");

            migrationBuilder.DropIndex(
                name: "IX_StockRefills_TankId",
                table: "StockRefills");

            migrationBuilder.DropColumn(
                name: "TankName",
                table: "Tanks");

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 8, 3, 51, 34, 24, DateTimeKind.Local).AddTicks(9636));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 2,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 8, 3, 51, 34, 24, DateTimeKind.Local).AddTicks(9638));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 3,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 8, 3, 51, 34, 24, DateTimeKind.Local).AddTicks(9640));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 4,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 8, 3, 51, 34, 24, DateTimeKind.Local).AddTicks(9642));
        }
    }
}
