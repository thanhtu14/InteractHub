using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InteractHub.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePostAndAddMedia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Post");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Likes",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Likes");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Post",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
