using Elysian.Application.Features.Assistant.Commands;
using ElysianFunctions.Middleware;
using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace ElysianFunctions
{
    /// <summary>
    /// The budget assistant drawer (docs/assistant-plan.md). Signed-in budget users only (the MediatR commands carry
    /// [Authorize(BudgetRead)]); the person comes from the Static Web App's principal header, never the request body.
    /// Over a limit is a 429 with Retry-After; switched off (Assistant__Enabled) is a 404.
    /// </summary>
    public class AssistantFunctions(IMediator mediator)
    {
        /// <summary>{ question, history: [{ role, text }], today: "yyyy-MM-dd", page, pageMonth: "yyyy-MM" }</summary>
        [Function("AskAssistant")]
        public async Task<HttpResponseData> AskAssistant([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req, FunctionContext context)
        {
            var command = await req.DeserializeBodyAsync<AskAssistantCommand>();
            return await req.WriteJsonResponseAsync(await mediator.Send(command!, context.CancellationToken));
        }

        /// <summary>
        /// The person tapped Confirm on a proposal card (docs/assistant-actions-plan.md §4): { actionId, includeRule }.
        /// Needs budget write. Expired or cancelled is a 409; someone else's id is a 404. Claude never calls these.
        /// </summary>
        [Function("ConfirmAssistantAction")]
        public async Task<HttpResponseData> ConfirmAssistantAction([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req, FunctionContext context)
        {
            var command = await req.DeserializeBodyAsync<ConfirmAssistantActionCommand>();
            return await req.WriteJsonResponseAsync(await mediator.Send(command!, context.CancellationToken));
        }

        /// <summary>{ actionId }</summary>
        [Function("CancelAssistantAction")]
        public async Task<HttpResponseData> CancelAssistantAction([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req, FunctionContext context)
        {
            var command = await req.DeserializeBodyAsync<CancelAssistantActionCommand>();
            return await req.WriteJsonResponseAsync(await mediator.Send(command!, context.CancellationToken));
        }

        /// <summary>{ actionId }. Within 24 hours of confirming; a merge can't be undone.</summary>
        [Function("UndoAssistantAction")]
        public async Task<HttpResponseData> UndoAssistantAction([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req, FunctionContext context)
        {
            var command = await req.DeserializeBodyAsync<UndoAssistantActionCommand>();
            return await req.WriteJsonResponseAsync(await mediator.Send(command!, context.CancellationToken));
        }

        /// <summary>Questions left today, and whether the assistant is on (the drawer hides its button when it isn't)</summary>
        [Function("GetAssistantUsage")]
        public async Task<HttpResponseData> GetAssistantUsage([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var today = DateOnly.TryParse(req.Query["today"], out var d) ? d : (DateOnly?)null;
            return await req.WriteJsonResponseAsync(await mediator.Send(new GetAssistantUsageQuery(today)));
        }
    }
}
