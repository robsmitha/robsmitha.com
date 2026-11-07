using Elysian.Application.Features.Financial.Sync;
using Elysian.Application.Interfaces;
using Elysian.Domain.Constants;
using Elysian.Domain.Data;
using Finbuckle.MultiTenant;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ElysianFunctions
{
    /// <summary>
    /// Background bank syncing (docs/budget-plan.md §4.6). Webhooks, "Sync now" and the nightly job all put a message on
    /// the plaid-sync queue; this function drains it one bank at a time.
    /// </summary>
    public class PlaidFunctions(ILogger<PlaidFunctions> logger, IMultiTenantStore<ElysianTenantInfo> tenantStore,
        IServiceScopeFactory serviceScopeFactory)
    {
        private const string QueueName = "plaid-sync";

        // Banks synced within this long are skipped by the nightly job
        private static readonly TimeSpan NightlyFreshness = TimeSpan.FromHours(20);

        [Function("SyncPlaidItem")]
        public async Task SyncPlaidItem([QueueTrigger(QueueName)] string body, FunctionContext context)
        {
            var message = PlaidSyncQueue.Deserialize(body);
            var tenant = await tenantStore.TryGetByIdentifierAsync(message.Tenant);
            if (tenant == null)
            {
                logger.LogWarning("Dropped a sync for unknown tenant {Tenant}", message.Tenant);
                return;
            }

            // ElysianContext reads the tenant when it's created, so set it before resolving one
            using var scope = serviceScopeFactory.CreateScope();
            scope.ServiceProvider.GetRequiredService<IMultiTenantContextSetter>().MultiTenantContext =
                new MultiTenantContext<ElysianTenantInfo> { TenantInfo = tenant };
            var sync = scope.ServiceProvider.GetRequiredService<ITransactionSyncService>();

            var outcome = await sync.SyncAsync(message.InstitutionAccessItemId, message.Trigger, context.CancellationToken);
            if (outcome.Retry)
            {
                // Plaid or the bank had a temporary problem: let the queue try again (up to 5 times, then poison)
                throw new InvalidOperationException($"Sync of item {message.InstitutionAccessItemId} failed with {outcome.ErrorCode}; will retry.");
            }
        }

        /// <summary>Every night (09:00 UTC, early morning in the US): catch up anything a webhook missed.</summary>
        [Function("NightlyPlaidSync")]
        public async Task NightlyPlaidSync([TimerTrigger("0 0 9 * * *")] TimerInfo timer, CancellationToken cancellationToken)
        {
            foreach (var tenant in await tenantStore.GetAllAsync())
            {
                using var scope = serviceScopeFactory.CreateScope();
                scope.ServiceProvider.GetRequiredService<IMultiTenantContextSetter>().MultiTenantContext =
                    new MultiTenantContext<ElysianTenantInfo> { TenantInfo = tenant };
                var sync = scope.ServiceProvider.GetRequiredService<ITransactionSyncService>();
                var queue = scope.ServiceProvider.GetRequiredService<IPlaidSyncQueue>();

                var due = await sync.GetItemsDueForSyncAsync(NightlyFreshness, cancellationToken);
                foreach (var itemId in due)
                {
                    await queue.EnqueueAsync(itemId, SyncTrigger.Nightly, cancellationToken);
                }
                if (due.Count > 0)
                {
                    logger.LogInformation("Queued {Count} nightly sync(s) for {Tenant}", due.Count, tenant.Identifier);
                }
            }
        }
    }
}
