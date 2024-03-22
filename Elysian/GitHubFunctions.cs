using System.Net;
using Elysian.Application.Extensions;
using Elysian.Application.Interfaces;
using Elysian.Application.Models;
using Elysian.Domain.Constants;
using Elysian.Domain.Data;
using Elysian.Domain.Security;
using Elysian.Infrastructure.Context;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Elysian
{
    public class GitHubFunctions(ILoggerFactory loggerFactory, IConfiguration configuration, IGitHubService gitHubService,
        IClaimsPrincipalAccessor claimsPrincipalAccessor, ElysianContext context)
    {
        private readonly ILogger _logger = loggerFactory.CreateLogger<GitHubFunctions>();
        private readonly IConfiguration _configuration = configuration;
        private readonly IGitHubService _gitHubService = gitHubService;
        private readonly IClaimsPrincipalAccessor _claimsPrincipalAccessor = claimsPrincipalAccessor;
        private readonly ElysianContext _context = context;

        // TODO: Protect endpoints with AuthorizationLevel.User
        // AuthorizationLevel settings do not work in development but after publishing to Azure, the authLevel setting is enforced.

        [Function("GitHubAuthMe")]
        public async Task<HttpResponseData> GitHubAuthMe([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var oAuthToken = _claimsPrincipalAccessor.IsAuthenticated
                ? await _context.OAuthTokens.SingleOrDefaultAsync(t => t.UserId == _claimsPrincipalAccessor.UserId && t.OAuthProvider == OAuthProviders.GitHub)
                : null;
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
                var userGitHubTokenQuery = _context.OAuthTokens.Where(t => t.UserId == _claimsPrincipalAccessor.UserId && t.OAuthProvider == OAuthProviders.GitHub);

                var accessToken = _claimsPrincipalAccessor.IsAuthenticated && await userGitHubTokenQuery.AnyAsync()
                    ? await userGitHubTokenQuery.Select(t => t.AccessToken).SingleOrDefaultAsync()
                    : _configuration.GetSection("DefaultAccessTokens:GitHub").Get<string>();

                var result = await _gitHubService.GetGitHubCodeSearchResultsAsync(new GitHubCodeSearchRequest
                {
                    Term = term,
                    AccessToken = accessToken
                });

                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/json; charset=utf-8");
                await response.WriteStringAsync(JsonConvert.SerializeObject(new
                {
                    result
                }));

                return response;
            }
            catch (RateLimitExceededException ex)
            {
                _logger.LogError(ex, "Rate Limit Reached. [Term: {term}]", term);
                return await req.WriteFailureResponseAsync(HttpStatusCode.TooManyRequests, "Too many requests.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception sending the Search Code request.[Term: {term}]", term);
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
                var userGitHubTokenQuery = _context.OAuthTokens.Where(t => t.UserId == _claimsPrincipalAccessor.UserId && t.OAuthProvider == OAuthProviders.GitHub);

                var accessToken = _claimsPrincipalAccessor.IsAuthenticated && await userGitHubTokenQuery.AnyAsync()
                    ? await userGitHubTokenQuery.Select(t => t.AccessToken).SingleOrDefaultAsync()
                    : _configuration.GetSection("DefaultAccessTokens:GitHub").Get<string>();

                var result = await _gitHubService.GetRepositoryContentsAsHtmlAsync(new GitHubRepositoryContentsRequest("robsmitha", repo, path, accessToken));

                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/html; charset=utf-8");
                await response.WriteStringAsync(result);

                return response;
            }
            catch (RateLimitExceededException ex)
            {
                _logger.LogError(ex, "Rate Limit Reached. [Repo: {repo}, Path: {term}]", repo, path);
                return await req.WriteFailureResponseAsync(HttpStatusCode.TooManyRequests, "Too many requests.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception sending the Repository Contents request. [Repo: {repo}, Path: {term}]", repo, path);
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to send Repository Contents request.");
            }
        }

        [Function("GitHubOAuthUrl")]
        public async Task<HttpResponseData> GetGitHubOAuthUrl([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            if (!_claimsPrincipalAccessor.IsAuthenticated)
            {
                return await req.WriteFailureResponseAsync(HttpStatusCode.Forbidden, "Authentication Failure.");
            }

            try
            {
                var oAuthState = new OAuthState
                {
                    State = Guid.NewGuid().ToString(),
                    OAuthProvider = OAuthProviders.GitHub,
                    UserId = _claimsPrincipalAccessor.UserId,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.AddAsync(oAuthState);
                await _context.SaveChangesAsync();

                var oAuthUrl = await _gitHubService.GetGitHubOAuthUrlAsync(oAuthState.State);

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
                _logger.LogError(ex, "An unhandled exception occurred getting GitHub OAuth Url.");
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to get GitHub OAuth Url.");
            }
        }
        
        [Function("GitHubOAuthCallback")]
        public async Task<HttpResponseData> GitHubOAuthCallback([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            if (!_claimsPrincipalAccessor.IsAuthenticated)
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

                var oAuthState = await _context.OAuthStates.OrderByDescending(s => s.CreatedAt)
                    .FirstOrDefaultAsync(s => s.UserId == _claimsPrincipalAccessor.UserId && s.OAuthProvider == OAuthProviders.GitHub);

                if (string.IsNullOrWhiteSpace(oAuthState?.State))
                {
                    return await req.WriteFailureResponseAsync(HttpStatusCode.BadRequest, "OAuth State Not Found.");
                }

                if (!OAuthStateEncryptor.Validate(_configuration.GetValue<string>("SecretKey"), oAuthState.State, accessTokenRequest.state))
                {
                    return await req.WriteFailureResponseAsync(HttpStatusCode.BadRequest, "Invalid State.");
                }

                var accessToken = await _gitHubService.GetGitHubAccessTokenAsync(accessTokenRequest);

                var existingOAuthToken = await _context.OAuthTokens.SingleOrDefaultAsync(t => t.UserId == _claimsPrincipalAccessor.UserId && t.OAuthProvider == OAuthProviders.GitHub);
                var oAuthToken = new OAuthToken
                {
                    AccessToken = accessToken.access_token,
                    OAuthProvider = "github",
                    TokenType = accessToken.token_type,
                    Scope = accessToken.scope,
                    UserId = _claimsPrincipalAccessor.UserId
                };

                if (existingOAuthToken != null)
                {
                    _context.Remove(existingOAuthToken);
                }
                _context.Remove(oAuthState);
                await _context.AddAsync(oAuthToken);
                await _context.SaveChangesAsync();

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
                _logger.LogError(ex, "An unhandled exception occurred getting GitHub Access Token.");
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to get GitHub Access Token.");
            }
        }
    }
}
