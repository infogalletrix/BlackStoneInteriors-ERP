using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Blackstone_Interior.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSiteFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Sites",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "SurveyDate",
                table: "Sites",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "SurveyNotes",
                table: "Sites",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "SurveyStatus",
                table: "Sites",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Activities",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Sites");

            migrationBuilder.DropColumn(
                name: "SurveyDate",
                table: "Sites");

            migrationBuilder.DropColumn(
                name: "SurveyNotes",
                table: "Sites");

            migrationBuilder.DropColumn(
                name: "SurveyStatus",
                table: "Sites");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Activities");
        }
    }
}
