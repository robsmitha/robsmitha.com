using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elysian.Application.Models
{
    public record GitHubRepositoryContentsRequest(string Username, string RepoName, string Path, string AccessToken);
}
