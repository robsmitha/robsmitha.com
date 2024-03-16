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
        private readonly ILogger<WordPressFunctions> _logger = logger;
        private readonly IWordPressService _wordPressService = wordPressService;

        [Function("WordPressContent")]
        public async Task<HttpResponseData> GitHubAuthMe([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            try
            {
                var content = await _wordPressService.GetWordPressContentAsync();
                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/json; charset=utf-8");
                await response.WriteStringAsync(JsonConvert.SerializeObject(content));

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred getting WordPress page content.");
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to send Search Code request.");
            }
        }
    }
}
