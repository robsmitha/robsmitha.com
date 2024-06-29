using System.Net;
using Elysian.Application.Extensions;
using Elysian.Application.Features.Code.Commands;
using Elysian.Application.Features.Code.Models;
using Elysian.Application.Features.Code.Queries;
using Elysian.Application.Interfaces;
using Elysian.Domain.Constants;
using Elysian.Domain.Data;
using Elysian.Domain.Responses.GitHub;
using Elysian.Domain.Security;
using Elysian.Infrastructure.Context;
using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Elysian
{
    public class GitHubFunctions(ILogger<GitHubFunctions> logger, IConfiguration configuration, IGitHubService gitHubService,
        IClaimsPrincipalAccessor claimsPrincipalAccessor, ElysianContext context,
        IMediator mediator)
    {
        // TODO: Protect endpoints with AuthorizationLevel.User
        // AuthorizationLevel settings do not work in development but after publishing to Azure, the authLevel setting is enforced.

        [Function("GitHubAuthMe")]
        public async Task<HttpResponseData> GitHubAuthMe([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var oAuthToken = await mediator.Send(new GetGitHubAccessTokenQuery());

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "text/json; charset=utf-8");
            await response.WriteStringAsync(JsonConvert.SerializeObject(new
            {
                HasGitHubOAuthToken = !string.IsNullOrWhiteSpace(oAuthToken?.AccessToken)
            }));

            return response;
        }

        [Function("GitHubSearch")]
        public async Task<HttpResponseData> GitHubSearch([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var term = req.Query["term"];

            try
            {
                var result = await mediator.Send(new SearchCodeQuery(term));

                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/json; charset=utf-8");
                await response.WriteStringAsync(JsonConvert.SerializeObject(new
                {
                    result
                }));

                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception sending the Search Code request.[Term: {term}]", term);
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to send Search Code request.");
            }
        }


        [Function("GitHubRepoContents")]
        public async Task<HttpResponseData> GitHubRepoContents([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var path = req.Query["path"];
            var repo = req.Query["repo"];

            try
            {
                var result = await mediator.Send(new GetFileContentQuery(repo, path));

                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/html; charset=utf-8");
                await response.WriteStringAsync(result.Html);

                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception sending the Repository Contents request. [Repo: {repo}, Path: {term}]", repo, path);
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to send Repository Contents request.");
            }
        }

        [Function("GitHubOAuthUrl")]
        public async Task<HttpResponseData> GetGitHubOAuthUrl([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            if (!claimsPrincipalAccessor.IsAuthenticated)
            {
                return await req.WriteFailureResponseAsync(HttpStatusCode.Forbidden, "Authentication Failure.");
            }

            try
            {
                var oAuthUrl = await mediator.Send(new CreateGitHubOAuthUrlCommand());

                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/json; charset=utf-8");
                await response.WriteStringAsync(JsonConvert.SerializeObject(new
                {
                    oAuthUrl = oAuthUrl.url
                }));

                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception occurred getting GitHub OAuth Url.");
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to get GitHub OAuth Url.");
            }
        }
        
        [Function("GitHubOAuthCallback")]
        public async Task<HttpResponseData> GitHubOAuthCallback([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            if (!claimsPrincipalAccessor.IsAuthenticated)
            {
                return await req.WriteFailureResponseAsync(HttpStatusCode.Forbidden, "Authentication Failure.");
            }

            try
            {
                var accessTokenRequest = await req.DeserializeBodyAsync<GitHubAccessTokenRequest>();
                if (string.IsNullOrWhiteSpace(accessTokenRequest?.code) || string.IsNullOrWhiteSpace(accessTokenRequest?.state))
                {
                    return await req.WriteFailureResponseAsync(HttpStatusCode.BadRequest, "Code and State Required.");
                }

                var oAuthState = await context.OAuthStates.OrderByDescending(s => s.CreatedAt)
                    .FirstOrDefaultAsync(s => s.UserId == claimsPrincipalAccessor.UserId && s.OAuthProvider == OAuthProviders.GitHub);

                if (string.IsNullOrWhiteSpace(oAuthState?.State))
                {
                    return await req.WriteFailureResponseAsync(HttpStatusCode.BadRequest, "OAuth State Not Found.");
                }

                if (!OAuthStateEncryptor.Validate(configuration.GetValue<string>("SecretKey"), oAuthState.State, accessTokenRequest.state))
                {
                    return await req.WriteFailureResponseAsync(HttpStatusCode.BadRequest, "Invalid State.");
                }

                var oAuthToken = await mediator.Send(new CreateGitHubAccessTokenCommand(accessTokenRequest));

                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/json; charset=utf-8");
                await response.WriteStringAsync(JsonConvert.SerializeObject(new
                {
                    HasGitHubOAuthToken = !string.IsNullOrWhiteSpace(oAuthToken?.AccessToken)
                }));
                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception occurred getting GitHub Access Token.");
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to get GitHub Access Token.");
            }
        }
    }
}
