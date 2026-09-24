using CapitolSharp.Congress;
using CapitolSharp.Congress.Bills;
using CapitolSharp.Congress.Congresses;
using CapitolSharp.Congress.Enums;
using CapitolSharp.Congress.Laws;
using CapitolSharp.Congress.Nominations;
using CapitolSharp.Congress.Summaries;
using ElysianFunctions.Middleware;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace ElysianFunctions
{
    public class CongressFunctions(ILogger<CongressFunctions> logger, CapitolSharpCongress congressClient)
    {
        [Function("CongressGetBills")]
        public async Task<HttpResponseData> GetBills([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var offset = int.TryParse(req.Query["offset"], out var intOffset) ? intOffset : 0;
            var limit = int.TryParse(req.Query["limit"], out var intLimit) ? intLimit : 20;
            var fromDateTime = DateTime.TryParse(req.Query["fromDateTime"], out var dtFromDateTime) ? dtFromDateTime : (DateTime?)null;
            var toDateTime = DateTime.TryParse(req.Query["toDateTime"], out var dtToDateTime) ? dtToDateTime : (DateTime?)null;
            var sort = req.Query["sort"] ?? "updateDate";
            var direction = !string.IsNullOrEmpty(req.Query["direction"]) && req.TryGetEnumValue<SortByDirection>("direction", out var enumSortDirection) ? enumSortDirection : SortByDirection.desc;

            var bills = await congressClient.SendAsync(new BillListAllRequest
            {
                Offset = offset,
                Limit = limit,
                FromDateTime = fromDateTime,
                ToDateTime = toDateTime,
                Sort = sort,
                Direction = direction
            });
            return await req.WriteJsonResponseAsync(bills);
        }

        [Function("CongressGetBill")]
        public async Task<HttpResponseData> GetBill([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var congress = int.TryParse(req.Query["congress"], out var intCongress) ? intCongress : 0;
            var billType = !string.IsNullOrEmpty(req.Query["billType"]) && req.TryGetEnumValue<BillType>("billType", out var enumBillType) ? enumBillType : BillType.hr;
            var billNumber = int.TryParse(req.Query["billNumber"], out var intBillNumber) ? intBillNumber : 0;

            // The requests are independent, so send them together rather than one after another.
            // Lists ask for the API's max of 250, since its default page of 20 cuts off busy bills.
            var billDetails = congressClient.SendAsync(new BillDetailsRequest
            {
                Congress = congress,
                BillType = billType,
                BillNumber = billNumber
            });

            var billActions = congressClient.SendAsync(new BillActionsRequest
            {
                Congress = congress,
                BillType = billType,
                BillNumber = billNumber,
                Limit = 250
            });

            var billAmendments = congressClient.SendAsync(new BillAmendmentsRequest
            {
                Congress = congress,
                BillType = billType,
                BillNumber = billNumber,
                Limit = 250
            });

            var billCosponsors = congressClient.SendAsync(new BillCosponsorsRequest
            {
                Congress = congress,
                BillType = billType,
                BillNumber = billNumber,
                Limit = 250
            });

            var billSummaries = congressClient.SendAsync(new BillSummariesRequest
            {
                Congress = congress,
                BillType = billType,
                BillNumber = billNumber
            });

            var billCommittees = congressClient.SendAsync(new BillCommitteesRequest
            {
                Congress = congress,
                BillType = billType,
                BillNumber = billNumber
            });

            // Big bills can have dozens of related bills, more than the API's default page of 20.
            var billRelatedBills = congressClient.SendAsync(new BillRelatedbillsRequest
            {
                Congress = congress,
                BillType = billType,
                BillNumber = billNumber,
                Limit = 100
            });

            await Task.WhenAll(billDetails, billActions, billAmendments, billCosponsors, billSummaries, billCommittees, billRelatedBills);

            return await req.WriteJsonResponseAsync(new
            {
                billDetails = billDetails.Result,
                billActions = billActions.Result,
                billAmendments = billAmendments.Result,
                billCosponsors = billCosponsors.Result,
                billSummaries = billSummaries.Result,
                billCommittees = billCommittees.Result,
                billRelatedBills = billRelatedBills.Result
            });
        }

        [Function("CongressFeed")]
        public async Task<HttpResponseData> CongressFeed([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var offset = int.TryParse(req.Query["offset"], out var intOffset) ? intOffset : 0;

            // A past Congress can be asked for by number; otherwise follow the current one.
            if (int.TryParse(req.Query["congress"], out var intCongress))
            {
                var pastBillList = await congressClient.SendAsync(new SortedBillListByCongressRequest
                {
                    Congress = intCongress,
                    Limit = 10,
                    Offset = offset,
                    Sort = "updateDate"
                });

                return await req.WriteJsonResponseAsync(new
                {
                    congressDetails = new { number = intCongress },
                    billList = pastBillList
                });
            }

            var currentCongress = await congressClient.SendAsync(new CongressCurrentListRequest());

            if (currentCongress?.Congress?.Number.HasValue != true)
            {
                throw new Exception();
            }

            var billList = await congressClient.SendAsync(new SortedBillListByCongressRequest
            {
                Congress = currentCongress.Congress.Number.Value,
                Limit = 10,
                Offset = offset,
                Sort = "updateDate"
            });

            return await req.WriteJsonResponseAsync(new
            {
                congressDetails = currentCongress.Congress,
                billList
            });
        }

        [Function("CongressOverview")]
        public async Task<HttpResponseData> CongressOverview([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var congressList = congressClient.SendAsync(new CongressListRequest { Limit = 30 });

            int congress;
            if (!int.TryParse(req.Query["congress"], out congress))
            {
                var currentCongress = await congressClient.SendAsync(new CongressCurrentListRequest());
                if (currentCongress?.Congress?.Number.HasValue != true)
                {
                    throw new Exception();
                }
                congress = currentCongress.Congress.Number.Value;
            }

            // The rest are extras around the feed, so one failing section shouldn't blank the page.
            // The law list is ordered by update date, not enactment, so take a full page and
            // sort by law number (assigned in order) below. 250 covers all but the busiest Congresses.
            var laws = TryGetAsync(congressClient.SendAsync(new LawListByCongressRequest
            {
                Congress = congress,
                Limit = 250
            }));

            var summaries = TryGetAsync(congressClient.SendAsync(new BillSummariesByCongressRequest
            {
                Congress = congress,
                Sort = "updateDate",
                Limit = 6
            }));

            // Most nominations are routine military promotions with no description, so
            // take a big page and keep the civilian ones (judges, agency posts).
            var nominations = TryGetAsync(congressClient.SendAsync(new NominationListByCongressRequest
            {
                Congress = congress,
                Limit = 250
            }));

            // The by-type list can't sort by activity, but its total is an exact count of
            // bills introduced, so ask for one bill per type and keep the count.
            var billTypes = Enum.GetValues<BillType>()
                .Select(async billType => new
                {
                    type = billType.ToString().ToUpper(),
                    count = (await TryGetAsync(congressClient.SendAsync(new BillListByTypeRequest
                    {
                        Congress = congress,
                        BillType = billType,
                        Limit = 1
                    })))?.Pagination?.Count ?? 0
                })
                .ToList();

            await Task.WhenAll(congressList, laws, summaries, nominations, Task.WhenAll(billTypes));

            // Congress.gov's bill data starts with the 93rd Congress (1973).
            var congresses = (congressList.Result?.Congresses ?? [])
                .Select(c => new
                {
                    number = CongressNumberFromUrl(c.Url),
                    name = c.Name,
                    startYear = c.StartYear,
                    endYear = c.EndYear
                })
                .Where(c => c.number >= 93)
                .ToList();

            return await req.WriteJsonResponseAsync(new
            {
                congress = congresses.FirstOrDefault(c => c.number == congress) ?? new { number = congress, name = $"Congress {congress}", startYear = "", endYear = "" },
                congresses,
                laws = new
                {
                    count = laws.Result?.Pagination?.Count ?? 0,
                    bills = (laws.Result?.Bills ?? [])
                        .OrderByDescending(b => LawSequence(b.Laws?.FirstOrDefault()?.Number))
                        .Take(12)
                },
                billTypes = billTypes.Select(t => t.Result),
                summaries = summaries.Result?.Summaries ?? [],
                nominations = new
                {
                    count = nominations.Result?.Pagination?.Count ?? 0,
                    items = (nominations.Result?.Nominations ?? [])
                        .Where(n => n.NominationType?.IsCivilian == true && !string.IsNullOrEmpty(n.Description))
                        .Take(6)
                }
            });
        }

        private async Task<T?> TryGetAsync<T>(Task<T?> request) where T : class
        {
            try
            {
                return await request;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Congress overview request for {Response} failed.", typeof(T).Name);
                return null;
            }
        }

        // Law numbers look like "119-108": Congress, then the order it was enacted in.
        private static int LawSequence(string? lawNumber)
        {
            return int.TryParse(lawNumber?.Split('-').LastOrDefault(), out var sequence) ? sequence : 0;
        }

        // The congress list has no number field, only a url like ".../v3/congress/119?format=json".
        private static int CongressNumberFromUrl(string? url)
        {
            var match = System.Text.RegularExpressions.Regex.Match(url ?? "", @"/congress/(\d+)");
            return match.Success ? int.Parse(match.Groups[1].Value) : 0;
        }
    }

    // CapitolSharp 0.0.8 sends sort as "updateDate%2Bdesc", an encoded plus the API doesn't
    // recognize, so it silently returns bills unsorted. A space ("updateDate desc", sent as %20)
    // is what "updateDate+desc" means in a query string, and the API sorts on it.
    internal class SortedBillListByCongressRequest : BillListByCongressRequest
    {
        public override Dictionary<string, string> QueryStringParameters
        {
            get
            {
                var parameters = base.QueryStringParameters;
                if (!string.IsNullOrEmpty(Sort))
                {
                    parameters["sort"] = $"{Sort} {Direction}";
                }
                return parameters;
            }
        }
    }
}
