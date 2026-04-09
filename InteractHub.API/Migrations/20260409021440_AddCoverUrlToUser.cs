using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InteractHub.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCoverUrlToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoverUrl",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverUrl",
                table: "AspNetUsers");
        }
    }
}
