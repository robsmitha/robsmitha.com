using Elysian.Application.Interfaces;
using Elysian.Application.Models;
using Elysian.Domain.Security;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Text;

namespace Elysian.Infrastructure.Services
{
    public class GitHubService(IHttpClientFactory httpClientFactory, IConfiguration configuration) : IGitHubService
    {
        private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
        private readonly IConfiguration _configuration = configuration;

        public async Task<GitHubOAuthUrl> GetGitHubOAuthUrlAsync(string state)
        {
            var urlBuilder = new StringBuilder();
            urlBuilder.Append(_configuration.GetValue<string>("GitHub:OAuthBaseUrl"));
            urlBuilder.Append($"allow_signup=true");
            urlBuilder.Append($"&client_id={_configuration.GetValue<string>("GitHub:ClientId")}");
            urlBuilder.Append($"&redirect_uri={_configuration.GetValue<string>("GitHub:SuccessRedirectUri")}");
            urlBuilder.Append($"&state={OAuthStateEncryptor.ComputeHash(_configuration.GetValue<string>("SecretKey"), state)}");
            return new GitHubOAuthUrl(urlBuilder.ToString());
        }

        public async Task<GitHubAccessTokenResponse> GetGitHubAccessTokenAsync(GitHubAccessTokenRequest requestAccessToken)
        {
            var content = new StringContent(JsonConvert.SerializeObject(new
            {
                requestAccessToken?.code,
                client_id = _configuration.GetValue<string>("GitHub:ClientId"),
                client_secret = _configuration.GetValue<string>("GitHub:Secret")
            }), Encoding.UTF8, "application/json");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Accept", "application/json");

            var response = await client.PostAsync(_configuration.GetValue<string>("GitHub:OAuthGenerateAccessTokenUrl"), content);
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<GitHubAccessTokenResponse>(json) ?? throw new Exception("Empty Access Token.");
        }

        public async Task<GitHubCodeSearchResponse> GetGitHubCodeSearchResultsAsync(GitHubCodeSearchRequest requestCodeSearch)
        {
            var urlBuilder = new StringBuilder();
            urlBuilder.Append(_configuration.GetValue<string>("GitHub:SearchCodeUrl"));
            urlBuilder.Append($"q={requestCodeSearch.Term} user:robsmitha");

            var client = _httpClientFactory.CreateClient();
            var httpRequestMessage = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(urlBuilder.ToString())
            };
            httpRequestMessage.Headers.Add("Accept", "application/vnd.github+json,application/vnd.github.text-match+json");
            httpRequestMessage.Headers.Add("Authorization", $"Bearer {requestCodeSearch.AccessToken}");
            httpRequestMessage.Headers.Add("User-Agent", "robsmitha.com");
            httpRequestMessage.Headers.Add("X-GitHub-Api-Version", "2022-11-28");

            var response = await client.SendAsync(httpRequestMessage);

            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<GitHubCodeSearchResponse>(json);
        }

        public async Task<string> GetRepositoryContentsAsHtmlAsync(GitHubRepositoryContentsRequest requestRepoContents)
        {
            var urlBuilder = new StringBuilder();
            urlBuilder.Append(_configuration.GetValue<string>("GitHub:RepoContentsUri"));
            urlBuilder.Append($"/{requestRepoContents.Username}");
            urlBuilder.Append($"/{requestRepoContents.RepoName}");
            urlBuilder.Append("/contents");
            urlBuilder.Append($"/{requestRepoContents.Path}");

            var client = _httpClientFactory.CreateClient();
            var httpRequestMessage = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(urlBuilder.ToString())
            };
            httpRequestMessage.Headers.Add("Accept", "application/vnd.github+json,application/vnd.github.html+json");
            httpRequestMessage.Headers.Add("Authorization", $"Bearer {requestRepoContents.AccessToken}");
            httpRequestMessage.Headers.Add("User-Agent", "robsmitha.com");
            httpRequestMessage.Headers.Add("X-GitHub-Api-Version", "2022-11-28");

            var response = await client.SendAsync(httpRequestMessage);

            var html = await response.Content.ReadAsStringAsync();

            return html;
        }
    }
}
