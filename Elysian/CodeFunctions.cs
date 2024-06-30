using Elysian.Application.Extensions;
using Elysian.Application.Features.Code.Commands;
using Elysian.Application.Features.Code.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;
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
        public async Task<IActionResult> GenerateCode([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var generateCodeRequest = await req.DeserializeBodyAsync<CodeGenerationRequest>();

            var codeGenerationResponse = await mediator.Send(new GenerateCodeCommand(generateCodeRequest));

            return new OkObjectResult(new
            {
                code = codeGenerationResponse.Code
            });
        }
    }
}
