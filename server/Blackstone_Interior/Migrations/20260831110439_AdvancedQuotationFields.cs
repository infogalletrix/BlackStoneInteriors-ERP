using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Blackstone_Interior.Migrations
{
    /// <inheritdoc />
    public partial class AdvancedQuotationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AdditionalDiscount",
                table: "Quotations",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "CustomerGst",
                table: "Quotations",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "DeliveryLoading",
                table: "Quotations",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryTimeline",
                table: "Quotations",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "EmailId",
                table: "Quotations",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "InstallationMaterial",
                table: "Quotations",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "MobileNo",
                table: "Quotations",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalDiscount",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "CustomerGst",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "DeliveryLoading",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "DeliveryTimeline",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "EmailId",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "InstallationMaterial",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "MobileNo",
                table: "Quotations");
        }
    }
}
