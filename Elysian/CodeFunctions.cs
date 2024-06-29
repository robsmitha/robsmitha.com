using Elysian.Application.Extensions;
using Elysian.Application.Features.Code.Commands;
using Elysian.Application.Features.Code.Models;
using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Net;

namespace Elysian
{
    public class CodeFunctions(ILogger<CodeFunctions> logger, IMediator mediator)
    {
        [Function("CodeGeneration")]
        public async Task<HttpResponseData> GenerateCode([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var generateCodeRequest = await req.DeserializeBodyAsync<CodeGenerationRequest>();
            try
            {
                var codeGenerationResponse = await mediator.Send(new GenerateCodeCommand(generateCodeRequest));
                var content = new
                {
                    code = codeGenerationResponse.Code
                };
                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/json; charset=utf-8");
                await response.WriteStringAsync(JsonConvert.SerializeObject(content));

                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception occurred getting generated code content.");
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to process generate code request .");
            }
        }
    }
}
