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
    }
}
