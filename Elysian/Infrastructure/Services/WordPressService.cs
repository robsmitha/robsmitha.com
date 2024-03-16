using Elysian.Application.Interfaces;
using Elysian.Application.Models;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elysian.Infrastructure.Services
{
    public class WordPressService(IHttpClientFactory httpClientFactory, IConfiguration configuration) : IWordPressService
    {
        private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
        private readonly IConfiguration _configuration = configuration;

        public async Task<WordPressContent> GetWordPressContentAsync()
        {
            var client = _httpClientFactory.CreateClient();

            var pages = await client.GetStringAsync(_configuration.GetSection("WordPressCmsUri").Get<string>() + "/wp/v2/pages");
            var posts = await client.GetStringAsync(_configuration.GetSection("WordPressCmsUri").Get<string>() + "/wp/v2/posts");
            var tags = await client.GetStringAsync(_configuration.GetSection("WordPressCmsUri").Get<string>() + "/wp/v2/tags?per_page=100");

            return new WordPressContent
            {
                Pages = JsonConvert.DeserializeObject<dynamic>(pages),
                Posts = JsonConvert.DeserializeObject<dynamic>(posts),
                Tags = JsonConvert.DeserializeObject<dynamic>(tags),
            };
        }

    }
}
