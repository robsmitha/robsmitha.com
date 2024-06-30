using Elysian.Application.Features.ContentManagement.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace Elysian
{
    public class WordPressFunctions(ILogger<WordPressFunctions> logger, IMediator mediator)
    {
        [Function("WordPressContent")]
        public async Task<IActionResult> WordPressContent([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var content = await mediator.Send(new GetContentQuery());

            return new OkObjectResult(content);
        }
    }
}
