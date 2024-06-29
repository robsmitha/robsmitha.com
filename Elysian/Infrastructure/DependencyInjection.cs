using CapitolSharp.Congress;
using Elysian.Application.Interfaces;
using Elysian.Infrastructure.Context;
using Elysian.Infrastructure.Identity;
using Elysian.Infrastructure.Services;
using Elysian.Infrastructure.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elysian.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ElysianContext>(options 
                => options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            services.AddSingleton<IClaimsPrincipalAccessor, ClaimsPrincipalAccessor>();

            services.AddContentManagementFeatures(configuration);

            services.AddCodeFeatures(configuration);

            services.AddCongressFeatures(configuration);

            services.AddFinancialFeatures(configuration);


            return services;
        }

        private static IServiceCollection AddContentManagementFeatures(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddHttpClient<IWordPressService, WordPressService>(client =>
            {
                client.BaseAddress = configuration.GetValue<Uri>("WordPressCmsUri");
            });
            return services;
        }

        private static IServiceCollection AddCodeFeatures(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddHttpClient("GitHubApi", (httpClient) =>
            {
                httpClient.BaseAddress = new Uri("https://api.github.com");

                var accessToken = configuration.GetValue<string>("DefaultAccessTokens:GitHub");
                httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
                httpClient.DefaultRequestHeaders.Add("User-Agent", "robsmitha.com");
                httpClient.DefaultRequestHeaders.Add("X-GitHub-Api-Version", "2022-11-28");
            });
            
            services.AddHttpClient("GitHubOAuth", (httpClient) =>
            {
                httpClient.BaseAddress = new Uri("https://github.com");
                httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
            });
            
            services.AddTransient<IGitHubService, GitHubService>();

            return services;
        }

        private static IServiceCollection AddCongressFeatures(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<CongressApiSettings>(config =>
            {
                config.ApiKey = configuration.GetValue<string>("DefaultAccessTokens:CongressGov");
            });

            services.AddTransient<CapitolSharpCongress>(serviceProvider =>
            {
                var httpClientFactory = serviceProvider.GetRequiredService<IHttpClientFactory>();
                var congressApiSettings = serviceProvider.GetRequiredService<IOptions<CongressApiSettings>>();
                return new(httpClientFactory.CreateClient(), congressApiSettings.Value);
            });

            return services;
        }

        private static IServiceCollection AddFinancialFeatures(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<PlaidSettings>(configuration.GetSection(nameof(PlaidSettings)));

            services.AddTransient<ICategoryService, CategoryService>();
            services.AddTransient<IAccessTokenService, AccessTokenService>();
            services.AddTransient<IBudgetService, BudgetService>();
            services.AddTransient<IFinancialService, PlaidService>();
            services.AddHttpClient("PlaidClient", (serviceProvider, httpClient) =>
            {
                var plaidSettings = serviceProvider.GetRequiredService<IOptions<PlaidSettings>>();
                httpClient.BaseAddress = new Uri(plaidSettings.Value.BaseUrl);
            });
            return services;
        }
    }
}
