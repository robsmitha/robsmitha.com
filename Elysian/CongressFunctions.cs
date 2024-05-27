﻿using CapitolSharp.Congress.Enums;
using Elysian.Application.Extensions;
using Elysian.Application.Interfaces;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Net;

namespace Elysian
{
    public class CongressFunctions(ILogger<CongressFunctions> logger, ICongressService congressService)
    {
        [Function("CongressGetBills")]
        public async Task<HttpResponseData> GetBills([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var offset = int.TryParse(req.Query["offset"], out var intOffset) ? intOffset : 0;
            var limit = int.TryParse(req.Query["limit"], out var intLimit) ? intLimit : 20;
            var fromDateTime = DateTime.TryParse(req.Query["fromDateTime"], out var dtFromDateTime) ? dtFromDateTime : (DateTime?)null;
            var toDateTime = DateTime.TryParse(req.Query["toDateTime"], out var dtToDateTime) ? dtToDateTime : (DateTime?)null;
            var sort = req.Query["sort"] ?? "updateDate";
            var direction = !string.IsNullOrEmpty(req.Query["direction"]) && TryGetEnumValue<SortByDirection>(req.Query["direction"], out var enumSortDirection) ? enumSortDirection : SortByDirection.DESC;
            
            try
            {
                var bills = await congressService.GetBillsAsync(offset, limit, fromDateTime, toDateTime, sort, direction);
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
            var billType = !string.IsNullOrEmpty(req.Query["billType"]) && TryGetEnumValue<BillType>(req.Query["billType"], out var enumBillType) ? enumBillType : BillType.HR;
            var billNumber = int.TryParse(req.Query["billNumber"], out var intBillNumber) ? intBillNumber : 0;

            try
            {
                var bill = await congressService.GetBillAsync(congress, billType, billNumber);
                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/json; charset=utf-8");
                await response.WriteStringAsync(JsonConvert.SerializeObject(bill));

                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception occurred in the endpoint [Endpoint: {endpointName}].", nameof(GetBill));
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to send headless GetBill request.");
            }
        }
        public static bool TryGetEnumValue<T>(string input, out T result) where T : struct
        {
            return Enum.TryParse(input, true, out result);
        }
    }
}