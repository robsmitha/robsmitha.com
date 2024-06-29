using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Elysian.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Budget",
                columns: table => new
                {
                    BudgetId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Budget", x => x.BudgetId);
                });

            migrationBuilder.CreateTable(
                name: "FinancialCategory",
                columns: table => new
                {
                    FinancialCategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialCategory", x => x.FinancialCategoryId);
                });

            migrationBuilder.CreateTable(
                name: "InstitutionAccessItem",
                columns: table => new
                {
                    InstitutionAccessItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AccessToken = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ItemId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InstitutionId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstitutionAccessItem", x => x.InstitutionAccessItemId);
                });

            migrationBuilder.CreateTable(
                name: "OAuthState",
                columns: table => new
                {
                    OAuthStateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OAuthProvider = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    State = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OAuthState", x => x.OAuthStateId);
                });

            migrationBuilder.CreateTable(
                name: "OAuthToken",
                columns: table => new
                {
                    OAuthTokenId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OAuthProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AccessToken = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TokenType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Scope = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OAuthToken", x => x.OAuthTokenId);
                });

            migrationBuilder.CreateTable(
                name: "BudgetExcludedTransaction",
                columns: table => new
                {
                    BudgetExcludedTransactionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransactionId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BudgetId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetExcludedTransaction", x => x.BudgetExcludedTransactionId);
                    table.ForeignKey(
                        name: "FK_BudgetExcludedTransaction_Budget_BudgetId",
                        column: x => x.BudgetId,
                        principalTable: "Budget",
                        principalColumn: "BudgetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BudgetCategory",
                columns: table => new
                {
                    BudgetCategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Estimate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BudgetId = table.Column<int>(type: "int", nullable: false),
                    FinancialCategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetCategory", x => x.BudgetCategoryId);
                    table.ForeignKey(
                        name: "FK_BudgetCategory_Budget_BudgetId",
                        column: x => x.BudgetId,
                        principalTable: "Budget",
                        principalColumn: "BudgetId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BudgetCategory_FinancialCategory_FinancialCategoryId",
                        column: x => x.FinancialCategoryId,
                        principalTable: "FinancialCategory",
                        principalColumn: "FinancialCategoryId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TransactionCategory",
                columns: table => new
                {
                    TransactionCategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransactionId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FinancialCategoryId = table.Column<int>(type: "int", nullable: false),
                    BudgetId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransactionCategory", x => x.TransactionCategoryId);
                    table.ForeignKey(
                        name: "FK_TransactionCategory_Budget_BudgetId",
                        column: x => x.BudgetId,
                        principalTable: "Budget",
                        principalColumn: "BudgetId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TransactionCategory_FinancialCategory_FinancialCategoryId",
                        column: x => x.FinancialCategoryId,
                        principalTable: "FinancialCategory",
                        principalColumn: "FinancialCategoryId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BudgetAccessItem",
                columns: table => new
                {
                    BudgetAccessItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BudgetId = table.Column<int>(type: "int", nullable: false),
                    InstitutionAccessItemId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetAccessItem", x => x.BudgetAccessItemId);
                    table.ForeignKey(
                        name: "FK_BudgetAccessItem_Budget_BudgetId",
                        column: x => x.BudgetId,
                        principalTable: "Budget",
                        principalColumn: "BudgetId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BudgetAccessItem_InstitutionAccessItem_InstitutionAccessItemId",
                        column: x => x.InstitutionAccessItemId,
                        principalTable: "InstitutionAccessItem",
                        principalColumn: "InstitutionAccessItemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BudgetAccessItem_BudgetId",
                table: "BudgetAccessItem",
                column: "BudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetAccessItem_InstitutionAccessItemId",
                table: "BudgetAccessItem",
                column: "InstitutionAccessItemId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetCategory_BudgetId",
                table: "BudgetCategory",
                column: "BudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetCategory_FinancialCategoryId",
                table: "BudgetCategory",
                column: "FinancialCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetExcludedTransaction_BudgetId",
                table: "BudgetExcludedTransaction",
                column: "BudgetId");

            migrationBuilder.CreateIndex(
                name: "AK_InstitutionAccessItem_InstitutionId_UserId",
                table: "InstitutionAccessItem",
                columns: new[] { "InstitutionId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "AK_OAuthProvider_UserId",
                table: "OAuthToken",
                columns: new[] { "OAuthProvider", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TransactionCategory_BudgetId",
                table: "TransactionCategory",
                column: "BudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionCategory_FinancialCategoryId",
                table: "TransactionCategory",
                column: "FinancialCategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BudgetAccessItem");

            migrationBuilder.DropTable(
                name: "BudgetCategory");

            migrationBuilder.DropTable(
                name: "BudgetExcludedTransaction");

            migrationBuilder.DropTable(
                name: "OAuthState");

            migrationBuilder.DropTable(
                name: "OAuthToken");

            migrationBuilder.DropTable(
                name: "TransactionCategory");

            migrationBuilder.DropTable(
                name: "InstitutionAccessItem");

            migrationBuilder.DropTable(
                name: "Budget");

            migrationBuilder.DropTable(
                name: "FinancialCategory");
        }
    }
}
