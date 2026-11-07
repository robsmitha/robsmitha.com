using System.Net;
using Elysian.Application.Features.Financial.Commands;
using Elysian.Application.Features.Financial.Models;
using Elysian.Application.Features.Financial.Queries;
using Elysian.Application.Interfaces;
using ElysianFunctions.Middleware;
using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace ElysianFunctions
{
    public class FinancialFunctions(IMediator mediator)
    {
        #region Connections

        /// <summary>The accounts page: banks, accounts, balances, health and recent syncs (from SQL)</summary>
        [Function("GetConnections")]
        public async Task<HttpResponseData> GetConnections([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            return await req.WriteJsonResponseAsync(await mediator.Send(new GetConnectionsQuery()));
        }

        [Function("GetUserAccessItems")]
        public async Task<HttpResponseData> GetUserAccessItems([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            return await req.WriteJsonResponseAsync(await mediator.Send(new GetUserAccessItemsQuery()));
        }

        [Function("GetUserAccessItem")]
        public async Task<HttpResponseData> GetUserAccessItem([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            _ = int.TryParse(req.Query["userAccessItemId"], out var userAccessItemId);

            return await req.WriteJsonResponseAsync(await mediator.Send(new GetUserAccessItemQuery(userAccessItemId)));
        }

        /// <summary>
        /// A Plaid Link token. No id: link a new bank. With institutionAccessItemId: update mode for that bank (sign in
        /// again or renew); add mode=accounts to choose which accounts are shared. Tokens are looked up on the server.
        /// </summary>
        [Function("CreateFinancialLinkToken")]
        public async Task<HttpResponseData> CreateFinancialLinkToken([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            int? institutionAccessItemId = int.TryParse(req.Query["institutionAccessItemId"], out var id) ? id : null;
            var accountSelection = string.Equals(req.Query["mode"], "accounts", StringComparison.OrdinalIgnoreCase);

            return await req.WriteJsonResponseAsync(await mediator.Send(new CreateLinkTokenCommand(institutionAccessItemId, accountSelection)));
        }

        /// <summary>Finishes linking a bank from Plaid Link's onSuccess (409 if it's already linked)</summary>
        [Function("ExchangePlaidPublicToken")]
        public async Task<HttpResponseData> ExchangePlaidPublicToken([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var command = await req.DeserializeBodyAsync<ExchangePlaidPublicTokenCommand>();

            return await req.WriteJsonResponseAsync(await mediator.Send(command));
        }

        /// <summary>Older link endpoint, kept until every page uses ExchangePlaidPublicToken</summary>
        [Function("SetInstitutionAccessToken")]
        public async Task<HttpResponseData> SetInstitutionAccessToken([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var exchangePublicToken = await req.DeserializeBodyAsync<ExchangePublicTokenModel>();

            var result = await mediator.Send(new ExchangePlaidPublicTokenCommand(exchangePublicToken?.public_token ?? "", null, null));
            return await req.WriteJsonResponseAsync(result);
        }

        /// <summary>"Sync now": 202 when queued, 429 inside the cooldown</summary>
        [Function("SyncConnection")]
        public async Task<HttpResponseData> SyncConnection([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var command = await req.DeserializeBodyAsync<SyncConnectionCommand>();

            return await req.WriteJsonResponseAsync(await mediator.Send(command), HttpStatusCode.Accepted);
        }

        [Function("CompleteReconnect")]
        public async Task<HttpResponseData> CompleteReconnect([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var command = await req.DeserializeBodyAsync<CompleteReconnectCommand>();
            await mediator.Send(command);

            return await req.WriteJsonResponseAsync(new { Success = true });
        }

        [Function("RemoveConnection")]
        public async Task<HttpResponseData> RemoveConnection([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var command = await req.DeserializeBodyAsync<RemoveConnectionCommand>();
            await mediator.Send(command);

            return await req.WriteJsonResponseAsync(new { Success = true });
        }

        [Function("UpdateAccountSettings")]
        public async Task<HttpResponseData> UpdateAccountSettings([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var command = await req.DeserializeBodyAsync<UpdateAccountSettingsCommand>();
            await mediator.Send(command);

            return await req.WriteJsonResponseAsync(new { Success = true });
        }

        /// <summary>
        /// Plaid webhooks: https://robsmitha.com/api/PlaidWebhook?tenant=robsmitha. Trusted only after the
        /// Plaid-Verification signature checks out; answers fast and leaves the syncing to the queue.
        /// </summary>
        [Function("PlaidWebhook")]
        public async Task<HttpResponseData> PlaidWebhook([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            using var buffer = new MemoryStream();
            await req.Body.CopyToAsync(buffer);
            var jwt = req.Headers.TryGetValues("Plaid-Verification", out var values) ? values.FirstOrDefault() : null;

            var result = await mediator.Send(new HandlePlaidWebhookCommand(buffer.ToArray(), jwt));
            // A rejected one isn't retried by Plaid as long as it isn't a 5xx
            return result == WebhookResult.Rejected
                ? await req.WriteFailureResponseAsync(HttpStatusCode.BadRequest, "Webhook verification failed.")
                : await req.WriteJsonResponseAsync(new { Received = true });
        }

        #endregion

        #region Financial Categories

        /// <summary>The signed-in person's categories; ?includeArchived=true adds archived ones</summary>
        [Function("FinancialCategories")]
        public async Task<HttpResponseData> FinancialCategories([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var includeArchived = bool.TryParse(req.Query["includeArchived"], out var archived) && archived;
            return await req.WriteJsonResponseAsync(await mediator.Send(new GetCategoriesQuery(includeArchived)));
        }

        [Function("ArchiveCategory")]
        public async Task<HttpResponseData> ArchiveCategory([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            await mediator.Send(await req.DeserializeBodyAsync<ArchiveCategoryCommand>());
            return await req.WriteJsonResponseAsync(new { Success = true });
        }

        #endregion

        #region Transactions and rules

        /// <summary>?from=2026-11-01&amp;to=2026-11-30&amp;q=&amp;accountId=&amp;categoryId= (0 = none)&amp;view=all|spending|notCounted|review|pending&amp;page=&amp;pageSize=</summary>
        [Function("SearchTransactions")]
        public async Task<HttpResponseData> SearchTransactions([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var q = req.Query;
            var search = new TransactionSearch(
                From: DateOnly.TryParse(q["from"], out var from) ? from : null,
                To: DateOnly.TryParse(q["to"], out var to) ? to : null,
                Query: q["q"],
                FinancialAccountId: int.TryParse(q["accountId"], out var accountId) ? accountId : null,
                CategoryId: int.TryParse(q["categoryId"], out var categoryId) ? categoryId : null,
                View: Enum.TryParse<TransactionView>(q["view"], ignoreCase: true, out var view) ? view : TransactionView.All,
                Page: int.TryParse(q["page"], out var page) ? page : 1,
                PageSize: int.TryParse(q["pageSize"], out var pageSize) ? pageSize : 50);

            return await req.WriteJsonResponseAsync(await mediator.Send(new SearchTransactionsQuery(search)));
        }

        [Function("UpdateTransaction")]
        public async Task<HttpResponseData> UpdateTransaction([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var update = await req.DeserializeBodyAsync<TransactionUpdate>();
            return await req.WriteJsonResponseAsync(await mediator.Send(new UpdateTransactionCommand(update)));
        }

        [Function("BulkUpdateTransactions")]
        public async Task<HttpResponseData> BulkUpdateTransactions([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var command = await req.DeserializeBodyAsync<BulkUpdateTransactionsCommand>();
            return await req.WriteJsonResponseAsync(new { Updated = await mediator.Send(command) });
        }

        [Function("GetCategoryRules")]
        public async Task<HttpResponseData> GetCategoryRules([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            return await req.WriteJsonResponseAsync(await mediator.Send(new GetCategoryRulesQuery()));
        }

        [Function("SaveCategoryRule")]
        public async Task<HttpResponseData> SaveCategoryRule([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var command = await req.DeserializeBodyAsync<SaveCategoryRuleCommand>();
            return await req.WriteJsonResponseAsync(await mediator.Send(command));
        }

        [Function("DeleteCategoryRule")]
        public async Task<HttpResponseData> DeleteCategoryRule([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            await mediator.Send(await req.DeserializeBodyAsync<DeleteCategoryRuleCommand>());
            return await req.WriteJsonResponseAsync(new { Success = true });
        }

        /// <summary>How many transactions a rule would change, before it's saved</summary>
        [Function("PreviewCategoryRule")]
        public async Task<HttpResponseData> PreviewCategoryRule([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var rule = await req.DeserializeBodyAsync<CategoryRuleModel>();
            return await req.WriteJsonResponseAsync(new { Matches = await mediator.Send(new PreviewCategoryRuleQuery(rule)) });
        }

        [Function("SaveFinancialCategory")]
        public async Task<HttpResponseData> SaveFinancialCategory([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var model = await req.DeserializeBodyAsync<SaveCategoryModel>();

            return await req.WriteJsonResponseAsync(await mediator.Send(new SaveCategoryCommand(model, model.BudgetId, model.Estimate)));
        }

        #endregion

        #region Monthly budget (Phase 3)

        // The old per-budget endpoints (GetBudgets, GetBudget, SaveBudget, SetTransactionCategory, ...) were replaced by
        // these at the end of Phase 3 (docs/budget-plan.md, decision D1).

        private static DateOnly? Today(HttpRequestData req) => DateOnly.TryParse(req.Query["today"], out var d) ? d : null;

        /// <summary>?year=2026&amp;month=11&amp;today=2026-11-06 (the browser's date) → income, targets vs. spending, safe to spend, alerts</summary>
        [Function("GetBudgetMonth")]
        public async Task<HttpResponseData> GetBudgetMonth([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            _ = int.TryParse(req.Query["year"], out var year);
            _ = int.TryParse(req.Query["month"], out var month);
            return await req.WriteJsonResponseAsync(await mediator.Send(new GetBudgetMonthQuery(year, month, Today(req))));
        }

        /// <summary>{ year, month, targets: [{ categoryId, amount, rollover }] } replaces the month's targets</summary>
        [Function("SaveBudgetTargets")]
        public async Task<HttpResponseData> SaveBudgetTargets([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            await mediator.Send(await req.DeserializeBodyAsync<SaveBudgetTargetsCommand>());
            return await req.WriteJsonResponseAsync(new { Success = true });
        }

        /// <summary>{ year, month, fromYear, fromMonth } or { year, month, averageOfLast3: true }</summary>
        [Function("CopyBudgetTargets")]
        public async Task<HttpResponseData> CopyBudgetTargets([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            await mediator.Send(await req.DeserializeBodyAsync<CopyBudgetTargetsCommand>());
            return await req.WriteJsonResponseAsync(new { Success = true });
        }

        /// <summary>{ year, month, amount } (amount null goes back to counting paychecks)</summary>
        [Function("SetIncomeOverride")]
        public async Task<HttpResponseData> SetIncomeOverride([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            await mediator.Send(await req.DeserializeBodyAsync<SetIncomeOverrideCommand>());
            return await req.WriteJsonResponseAsync(new { Success = true });
        }

        /// <summary>?months=6 → counted spending per month, by category</summary>
        [Function("GetSpendingTrends")]
        public async Task<HttpResponseData> GetSpendingTrends([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var months = int.TryParse(req.Query["months"], out var m) ? m : 6;
            return await req.WriteJsonResponseAsync(await mediator.Send(new GetSpendingTrendsQuery(months, Today(req))));
        }

        /// <summary>Bills and subscriptions found in the last ~13 months, with their next date</summary>
        [Function("GetRecurring")]
        public async Task<HttpResponseData> GetRecurring([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            return await req.WriteJsonResponseAsync(await mediator.Send(new GetRecurringQuery(Today(req))));
        }

        [Function("GetIncomeStreams")]
        public async Task<HttpResponseData> GetIncomeStreams([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            return await req.WriteJsonResponseAsync(await mediator.Send(new GetIncomeStreamsQuery()));
        }

        [Function("SaveIncomeStream")]
        public async Task<HttpResponseData> SaveIncomeStream([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var stream = await req.DeserializeBodyAsync<IncomeStreamModel>();
            return await req.WriteJsonResponseAsync(await mediator.Send(new SaveIncomeStreamCommand(stream)));
        }

        [Function("RemoveIncomeStream")]
        public async Task<HttpResponseData> RemoveIncomeStream([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            await mediator.Send(await req.DeserializeBodyAsync<RemoveIncomeStreamCommand>());
            return await req.WriteJsonResponseAsync(new { Success = true });
        }

        [Function("GetNotificationSettings")]
        public async Task<HttpResponseData> GetNotificationSettings([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            return await req.WriteJsonResponseAsync(await mediator.Send(new GetNotificationSettingsQuery()));
        }

        [Function("SaveNotificationSettings")]
        public async Task<HttpResponseData> SaveNotificationSettings([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var settings = await req.DeserializeBodyAsync<NotificationSettingsModel>();
            return await req.WriteJsonResponseAsync(await mediator.Send(new SaveNotificationSettingsCommand(settings)));
        }

        #endregion

        #region Debt payoff (Phase 4)

        /// <summary>?extra=100&amp;today=2026-11-06 → debts, both strategies, the chosen schedule, a what-if, plan vs. actual</summary>
        [Function("GetDebtPlan")]
        public async Task<HttpResponseData> GetDebtPlan([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var extra = decimal.TryParse(req.Query["extra"], System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.InvariantCulture, out var e) ? e : 0;
            return await req.WriteJsonResponseAsync(await mediator.Send(new GetDebtPlanQuery(extra, Today(req))));
        }

        /// <summary>APR, minimum, due day and promo terms; a manual debt also takes name and balance. No id adds a manual debt.</summary>
        [Function("SaveDebt")]
        public async Task<HttpResponseData> SaveDebt([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var debt = await req.DeserializeBodyAsync<DebtModel>();
            return await req.WriteJsonResponseAsync(await mediator.Send(new SaveDebtCommand(debt)));
        }

        [Function("RemoveDebt")]
        public async Task<HttpResponseData> RemoveDebt([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            await mediator.Send(await req.DeserializeBodyAsync<RemoveDebtCommand>());
            return await req.WriteJsonResponseAsync(new { Success = true });
        }

        /// <summary>{ monthlyAmount, strategy: "Avalanche" | "Snowball" | "Custom", customOrder: [debtId] } freezes a new baseline</summary>
        [Function("SaveDebtPlan")]
        public async Task<HttpResponseData> SaveDebtPlan([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var plan = await req.DeserializeBodyAsync<SaveDebtPlanModel>();
            await mediator.Send(new SaveDebtPlanCommand(plan, Today(req)));
            return await req.WriteJsonResponseAsync(new { Success = true });
        }

        #endregion

        #region Savings goals (Phase 5)

        /// <summary>?today=2026-11-06 → goals with pace and monthly amounts, savings accounts, transfers that can be tagged</summary>
        [Function("GetGoals")]
        public async Task<HttpResponseData> GetGoals([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            return await req.WriteJsonResponseAsync(await mediator.Send(new GetGoalsQuery(Today(req))));
        }

        [Function("SaveGoal")]
        public async Task<HttpResponseData> SaveGoal([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var goal = await req.DeserializeBodyAsync<GoalModel>();
            return await req.WriteJsonResponseAsync(await mediator.Send(new SaveGoalCommand(goal, Today(req))));
        }

        [Function("ArchiveGoal")]
        public async Task<HttpResponseData> ArchiveGoal([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            await mediator.Send(await req.DeserializeBodyAsync<ArchiveGoalCommand>());
            return await req.WriteJsonResponseAsync(new { Success = true });
        }

        /// <summary>{ savingsGoalId, amount, date, note } typed in, or { savingsGoalId, bankTransactionId } from a transfer</summary>
        [Function("AddGoalContribution")]
        public async Task<HttpResponseData> AddGoalContribution([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var contribution = await req.DeserializeBodyAsync<AddContributionModel>();
            return await req.WriteJsonResponseAsync(await mediator.Send(new AddGoalContributionCommand(contribution, Today(req))));
        }

        [Function("RemoveGoalContribution")]
        public async Task<HttpResponseData> RemoveGoalContribution([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            await mediator.Send(await req.DeserializeBodyAsync<RemoveGoalContributionCommand>());
            return await req.WriteJsonResponseAsync(new { Success = true });
        }

        #endregion

        // The receivables ("Income sources") endpoints were retired in Phase 1 (docs/budget-plan.md, decision D6).
        // Their tables stay until a cleanup migration after Phase 3.
    }
}
