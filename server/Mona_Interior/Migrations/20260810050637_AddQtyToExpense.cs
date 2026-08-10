using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mona_Interior.Migrations
{
    /// <inheritdoc />
    public partial class AddQtyToExpense : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Qty",
                table: "Expenses",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Qty",
                table: "Expenses");
        }
    }
}
