using CapitolSharp.Congress;
using CapitolSharp.Congress.Bills;
using CapitolSharp.Congress.Congresses;
using CapitolSharp.Congress.Enums;
using Elysian.Application.Extensions;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
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

        [Function("CongressFeed")]
        public async Task<dynamic> CongressFeed([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var offset = int.TryParse(req.Query["offset"], out var intOffset) ? intOffset : 0;
            var currentCongress = await congressClient.SendAsync(new CongressCurrentListRequest());

            if (currentCongress?.Congress?.Number.HasValue != true)
            {
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to get current congress.");
            }

            var billList = await congressClient.SendAsync(new BillListByCongressRequest
            {
                Congress = currentCongress.Congress.Number.Value,
                Limit = 10,
                Offset = offset
            });

            return new 
            { 
                congressDetails = currentCongress.Congress,
                billList
            };
        }

        public static bool TryGetEnumValue<T>(string input, out T result) where T : struct
        {
            return Enum.TryParse(input, true, out result);
        }
    }
}
