using Elysian.Application.Features.ContentManagement.Queries;
using ElysianFunctions.Middleware;
using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace ElysianFunctions
{
    public class ContentManagementFunctions(ILogger<ContentManagementFunctions> logger, IMediator mediator)
    {
        [Function("WordPressContent")]
        public async Task<HttpResponseData> WordPressContent([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var content = await mediator.Send(new GetContentQuery());
            return await req.WriteJsonResponseAsync(content);
        }
    }
}
