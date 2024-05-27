using Elysian.Application.Extensions;
using Elysian.Application.Interfaces;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Net;

namespace Elysian
{
    public class WordPressFunctions(ILogger<WordPressFunctions> logger, IWordPressService wordPressService)
    {
        [Function("WordPressContent")]
        public async Task<HttpResponseData> WordPressContent([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            try
            {
                var content = await wordPressService.GetWordPressContentAsync();
                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/json; charset=utf-8");
                await response.WriteStringAsync(JsonConvert.SerializeObject(content));

                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception occurred getting WordPress page content.");
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to send headless CMS content request.");
            }
        }
    }
}
