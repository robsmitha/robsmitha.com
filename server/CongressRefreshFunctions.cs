using System.Collections.Concurrent;
using CapitolSharp.Congress;
using CapitolSharp.Congress.Bills;
using CapitolSharp.Congress.Congresses;
using CapitolSharp.Congress.Enums;
using Elysian.Application.Features.Congress.Models;
using Elysian.Domain.Data;
using Elysian.Infrastructure.Context;
using Finbuckle.MultiTenant;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using Bill = CapitolSharp.Congress.Bills.BillDetails.Bill;

namespace ElysianFunctions
{
    /// <summary>
    /// Keeps saved bills' snapshots current, which is what flags new activity for their readers.
    /// </summary>
    public class CongressRefreshFunctions(ILogger<CongressRefreshFunctions> logger, CapitolSharpCongress congressClient,
        IMultiTenantStore<ElysianTenantInfo> tenantStore, IServiceScopeFactory serviceScopeFactory, TimeProvider timeProvider)
    {
        // Congress.gov allows 5,000 requests an hour per key; a few at a time stays well clear of it.
        private const int MaxConcurrentRequests = 4;

        [Function("CongressRefreshTrackedBills")]
        public async Task RefreshTrackedBills([TimerTrigger("0 0 */6 * * *")] TimerInfo timer, CancellationToken cancellationToken)
        {
            // Bills from past Congresses can't change any more, so only the current one needs checking.
            var currentCongress = await congressClient.SendAsync(new CongressCurrentListRequest());
            if (currentCongress?.Congress?.Number is not int congress)
            {
                logger.LogWarning("Skipped refreshing saved bills: could not get the current Congress.");
                return;
            }

            foreach (var tenant in await tenantStore.GetAllAsync())
            {
                await RefreshTenantAsync(tenant, congress, cancellationToken);
            }
        }

        private async Task RefreshTenantAsync(ElysianTenantInfo tenant, int congress, CancellationToken cancellationToken)
        {
            // ElysianContext reads the tenant when it's created, so set it before resolving one.
            using var scope = serviceScopeFactory.CreateScope();
            scope.ServiceProvider.GetRequiredService<IMultiTenantContextSetter>().MultiTenantContext =
                new MultiTenantContext<ElysianTenantInfo> { TenantInfo = tenant };
            var context = scope.ServiceProvider.GetRequiredService<ElysianContext>();

            var billTrackings = await context.BillTrackings
                .Where(b => b.Congress == congress)
                .ToListAsync(cancellationToken);

            if (billTrackings.Count == 0)
            {
                return;
            }

            // Many readers can save the same bill; ask Congress.gov about each one once.
            var bills = new ConcurrentDictionary<(string BillType, int BillNumber), Bill>();
            var billKeys = billTrackings.Select(b => (b.BillType, b.BillNumber)).Distinct();

            await Parallel.ForEachAsync(billKeys,
                new ParallelOptions { MaxDegreeOfParallelism = MaxConcurrentRequests, CancellationToken = cancellationToken },
                async (key, _) =>
                {
                    try
                    {
                        var response = await congressClient.SendAsync(new BillDetailsRequest
                        {
                            Congress = congress,
                            BillType = Enum.Parse<BillType>(key.BillType, ignoreCase: true),
                            BillNumber = key.BillNumber
                        });

                        if (response?.Bill != null)
                        {
                            bills[key] = response.Bill;
                        }
                    }
                    catch (Exception ex)
                    {
                        // One bad bill shouldn't stop the rest; it gets another try next run.
                        logger.LogWarning(ex, "Could not refresh saved bill {Congress} {BillType} {BillNumber}.",
                            congress, key.BillType, key.BillNumber);
                    }
                });

            var refreshedAt = timeProvider.GetUtcNow();
            var newActivity = 0;
            foreach (var billTracking in billTrackings)
            {
                if (bills.TryGetValue((billTracking.BillType, billTracking.BillNumber), out var bill))
                {
                    var hadUnseenActivity = billTracking.HasUnseenActivity;
                    billTracking.ApplySnapshot(bill, refreshedAt);
                    if (billTracking.HasUnseenActivity && !hadUnseenActivity)
                    {
                        newActivity++;
                    }
                }
            }

            await context.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "Refreshed {Refreshed} of {Total} saved bills for tenant {Tenant}; {NewActivity} have new activity.",
                billTrackings.Count(b => bills.ContainsKey((b.BillType, b.BillNumber))), billTrackings.Count,
                tenant.Identifier, newActivity);
        }
    }
}
