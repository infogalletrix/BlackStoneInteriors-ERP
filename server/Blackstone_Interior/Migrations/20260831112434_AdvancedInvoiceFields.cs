using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Blackstone_Interior.Migrations
{
    /// <inheritdoc />
    public partial class AdvancedInvoiceFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AdditionalDiscount",
                table: "Invoices",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DeliveryLoading",
                table: "Invoices",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryTimeline",
                table: "Invoices",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "EmailId",
                table: "Invoices",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "InstallationMaterial",
                table: "Invoices",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "MobileNo",
                table: "Invoices",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalDiscount",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "DeliveryLoading",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "DeliveryTimeline",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "EmailId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "InstallationMaterial",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "MobileNo",
                table: "Invoices");
        }
    }
}
