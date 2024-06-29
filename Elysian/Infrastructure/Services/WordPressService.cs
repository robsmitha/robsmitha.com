using Elysian.Application.Features.ContentManagement.Models;
using Elysian.Application.Interfaces;
using Newtonsoft.Json;

namespace Elysian.Infrastructure.Services
{
    public class WordPressService(HttpClient httpClient) : IWordPressService
    {
        public async Task<WordPressContent> GetWordPressContentAsync()
        {
            var pages = await httpClient.GetStringAsync("/wp-json/wp/v2/pages");
            var posts = await httpClient.GetStringAsync("/wp-json/wp/v2/posts");
            var tags = await httpClient.GetStringAsync("/wp-json/wp/v2/tags?per_page=100");
            var categories = await httpClient.GetStringAsync("/wp-json/wp/v2/categories?per_page=100");

            return new WordPressContent
            {
                Pages = JsonConvert.DeserializeObject<dynamic>(pages),
                Posts = JsonConvert.DeserializeObject<dynamic>(posts),
                Tags = JsonConvert.DeserializeObject<dynamic>(tags),
                Categories = JsonConvert.DeserializeObject<dynamic>(categories),
            };
        }

    }
}
