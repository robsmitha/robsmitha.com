using Elysian.Application.Models;

namespace Elysian.Application.Interfaces
{
    public interface IGitHubService
    {
        Task<GitHubOAuthUrl> GetGitHubOAuthUrlAsync(string state);
        Task<GitHubAccessTokenResponse> GetGitHubAccessTokenAsync(GitHubAccessTokenRequest requestAccessToken);
    }
}
