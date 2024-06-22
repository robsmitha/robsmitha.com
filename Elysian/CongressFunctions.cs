using CapitolSharp.Congress;
using CapitolSharp.Congress.Amendments;
using CapitolSharp.Congress.Bills;
using CapitolSharp.Congress.CommitteeReports;
using CapitolSharp.Congress.Congresses;
using CapitolSharp.Congress.Enums;
using CapitolSharp.Congress.Exceptions;
using CapitolSharp.Congress.Hearings;
using CapitolSharp.Congress.HouseCommunications;
using CapitolSharp.Congress.SenateCommunications;
using CapitolSharp.Congress.Summaries;
using Elysian.Application.Extensions;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Net;

namespace Elysian
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
            var direction = !string.IsNullOrEmpty(req.Query["direction"]) && TryGetEnumValue<SortByDirection>(req.Query["direction"], out var enumSortDirection) ? enumSortDirection : SortByDirection.desc;
            
            try
            {
                var bills = await congressClient.SendAsync(new BillListAllRequest
                {
                    Offset = offset,
                    Limit = limit,
                    FromDateTime = fromDateTime,
                    ToDateTime = toDateTime,
                    Sort = sort,
                    Direction = direction
                });
                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/json; charset=utf-8");
                await response.WriteStringAsync(JsonConvert.SerializeObject(bills));

                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception occurred in the endpoint [Endpoint: {endpointName}].", nameof(GetBills));
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to send headless GetBills request.");
            }
        }

        [Function("CongressGetBill")]
        public async Task<HttpResponseData> GetBill([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var congress = int.TryParse(req.Query["congress"], out var intCongress) ? intCongress : 0;
            var billType = !string.IsNullOrEmpty(req.Query["billType"]) && TryGetEnumValue<BillType>(req.Query["billType"], out var enumBillType) ? enumBillType : BillType.hr;
            var billNumber = int.TryParse(req.Query["billNumber"], out var intBillNumber) ? intBillNumber : 0;

            try
            {
                var billDetails = await congressClient.SendAsync(new BillDetailsRequest
                {
                    Congress = congress,
                    BillType = billType,
                    BillNumber = billNumber
                });

                var billActions = await congressClient.SendAsync(new BillActionsRequest
                {
                    Congress = congress,
                    BillType = billType,
                    BillNumber = billNumber
                });

                var billAmendments = await congressClient.SendAsync(new BillAmendmentsRequest
                {
                    Congress = congress,
                    BillType = billType,
                    BillNumber = billNumber
                });

                var billCosponsors = await congressClient.SendAsync(new BillCosponsorsRequest
                {
                    Congress = congress,
                    BillType = billType,
                    BillNumber = billNumber
                });

                //var billCommittees = await congressClient.SendAsync(new BillCommitteesRequest
                //{
                //    Congress = congress,
                //    BillType = billType,
                //    BillNumber = billNumber
                //});

                //var billRelatedBills = await congressClient.SendAsync(new BillRelatedbillsRequest
                //{
                //    Congress = congress,
                //    BillType = billType,
                //    BillNumber = billNumber
                //});

                //var billSubjects = await congressClient.SendAsync(new BillSubjectsRequest
                //{
                //    Congress = congress,
                //    BillType = billType,
                //    BillNumber = billNumber
                //});

                //var billSummaries = await congressClient.SendAsync(new BillSummariesRequest
                //{
                //    Congress = congress,
                //    BillType = billType,
                //    BillNumber = billNumber
                //});

                //var billText = await congressClient.SendAsync(new BillTextRequest
                //{
                //    Congress = congress,
                //    BillType = billType,
                //    BillNumber = billNumber
                //});

                //var billTitles = await congressClient.SendAsync(new BillTitlesRequest
                //{
                //    Congress = congress,
                //    BillType = billType,
                //    BillNumber = billNumber
                //});

                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/json; charset=utf-8");
                await response.WriteStringAsync(JsonConvert.SerializeObject(new
                {
                    billDetails, 
                    billActions,
                    billAmendments,
                    billCosponsors
                }));

                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception occurred in the endpoint [Endpoint: {endpointName}].", nameof(GetBill));
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to send headless GetBill request.");
            }
        }

        [Function("CongressMixer")]
        public async Task<dynamic> CongressMixer([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var currentCongress = await congressClient.SendAsync(new CongressCurrentListRequest());

            if (currentCongress?.Congress?.Number.HasValue != true)
            {
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to get current congress.");
            }

            var bills = await congressClient.SendAsync(new BillListByCongressRequest
            {
                Congress = currentCongress.Congress.Number.Value,
                Limit = 10
            });

            var amendments = await congressClient.SendAsync(new AmendmentListByCongressRequest
            {
                Congress = currentCongress.Congress.Number.Value,
                Limit = 10
            });

            var summaries = await congressClient.SendAsync(new BillSummariesByCongressRequest
            {
                Congress = currentCongress.Congress.Number.Value,
                Limit = 10
            });

            var mixed = bills.Bills.Select(b => new
            {
                key = "Bills_" + b.Number,
                title = $"{b.Type}{b.Number}",
                subtitle = b.Title,
                updated = b.UpdateDate,
                color = "yellow-darken-3",
                icon = "mdi-seal"
            })
            .Union(amendments.Amendments.Select(b => new
            {
                key = "Amendments_" + b.Number,
                title = $"{b.Type}{b.Number}",
                subtitle = !string.IsNullOrEmpty(b.Purpose) ? b.Purpose : b.LatestAction.Text,
                updated = b.UpdateDate,
                color = "blue-darken-2",
                icon = "mdi-fountain-pen"
            }))
            .Union(summaries.Summaries.Select(b => new
            {
                key = "Summaries_" + Guid.NewGuid(),
                title = b.ActionDesc,
                subtitle = b.Text,
                updated = b.UpdateDate,
                color = "grey-darken-2",
                icon = "mdi-text"
            }))
            .OrderByDescending(o => o.updated);

            return new 
            { 
                congressDetails = currentCongress.Congress,
                results = mixed
            };
        }

        public static bool TryGetEnumValue<T>(string input, out T result) where T : struct
        {
            return Enum.TryParse(input, true, out result);
        }
    }
}
