using CapitolSharp.Congress;
using CapitolSharp.Congress.Bills;
using CapitolSharp.Congress.Bills.BillDetails;
using CapitolSharp.Congress.Bills.BillListAll;
using CapitolSharp.Congress.Enums;
using Elysian.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Elysian.Infrastructure.Services
{
    public class CongressService(ILogger<CongressFunctions> logger, IConfiguration configuration, IHttpClientFactory httpClientFactory) : ICongressService
    {
        public async Task<BillListAllResponse> GetBillsAsync(int offset = 0, int limit = 20, 
            DateTime? fromDateTime = null, DateTime? toDateTime = null, string? sort = "updateDate", SortByDirection direction = SortByDirection.DESC)
        {
            var request = new BillListAllRequest
            {
                Offset = offset,
                Limit = limit,
                FromDateTime = fromDateTime,
                ToDateTime = toDateTime,
                Sort = sort,
                Direction = direction
            };

            var congressClient = new CapitolSharpCongress(httpClientFactory.CreateClient(), new CongressApiSettings
            {
                ApiKey = configuration.GetValue<string>("DefaultAccessTokens:CongressGov")
            });

            var response = await congressClient.SendAsync(request);

            return response;
        }
        public async Task<BillDetailsResponse> GetBillAsync(int congress, BillType billType, int billNumber)
        {
            var request = new BillDetailsRequest
            {
                Congress = congress,
                BillType = billType,
                BillNumber = billNumber
            };

            var congressClient = new CapitolSharpCongress(httpClientFactory.CreateClient(), new CongressApiSettings
            {
                ApiKey = configuration.GetValue<string>("DefaultAccessTokens:CongressGov")
            });

            var response = await congressClient.SendAsync(request);

            return response;
        }
    }
}
