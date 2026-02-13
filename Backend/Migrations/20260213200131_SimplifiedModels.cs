using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SimplifiedModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 14, 1, 1, 28, 573, DateTimeKind.Local).AddTicks(1181));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 2,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 14, 1, 1, 28, 573, DateTimeKind.Local).AddTicks(1186));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 3,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 14, 1, 1, 28, 573, DateTimeKind.Local).AddTicks(1189));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 4,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 14, 1, 1, 28, 573, DateTimeKind.Local).AddTicks(1191));

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Password", "Username" },
                values: new object[] { 1, "admin123", "admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 10, 20, 20, 57, 174, DateTimeKind.Local).AddTicks(7261));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 2,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 10, 20, 20, 57, 174, DateTimeKind.Local).AddTicks(7264));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 3,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 10, 20, 20, 57, 174, DateTimeKind.Local).AddTicks(7266));

            migrationBuilder.UpdateData(
                table: "Rates",
                keyColumn: "Id",
                keyValue: 4,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 10, 20, 20, 57, 174, DateTimeKind.Local).AddTicks(7268));
        }
    }
}
