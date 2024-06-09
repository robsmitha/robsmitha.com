using Azure.Identity;
using CapitolSharp.Congress;
using Elysian.Application.Interfaces;
using Elysian.Infrastructure.Context;
using Elysian.Infrastructure.Identity;
using Elysian.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

var host = new HostBuilder()
    .ConfigureAppConfiguration((context, config) =>
    {
        if (context.HostingEnvironment.IsDevelopment())
        {
            config.AddUserSecrets<Program>();
        }
    })
    .ConfigureServices((hostContext, services) =>
    {
        services.AddSingleton<IClaimsPrincipalAccessor, ClaimsPrincipalAccessor>();

        services.AddHttpClient<IWordPressService, WordPressService>(client =>
        {
            client.BaseAddress = hostContext.Configuration.GetValue<Uri>("WordPressCmsUri");
        });

        services.AddHttpClient("GitHubApi", (httpClient) =>
        {
            httpClient.BaseAddress = new Uri("https://api.github.com");

            var accessToken = hostContext.Configuration.GetValue<string>("DefaultAccessTokens:GitHub");
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


        services.Configure<CongressApiSettings>(config =>
        {
            config.ApiKey = hostContext.Configuration.GetValue<string>("DefaultAccessTokens:CongressGov");
        });
        services.AddTransient<CapitolSharpCongress>(serviceProvider =>
        {
            var httpClientFactory = serviceProvider.GetRequiredService<IHttpClientFactory>();
            var congressApiSettings = serviceProvider.GetRequiredService<IOptions<CongressApiSettings>>();
            return new(httpClientFactory.CreateClient(), congressApiSettings.Value);
        });

        services.AddDbContext<ElysianContext>(options => options.UseSqlServer(hostContext.Configuration.GetConnectionString("DefaultConnection")));
    })
    .ConfigureFunctionsWorkerDefaults(worker =>
    {
        worker.UseMiddleware<ClaimsPrincipalMiddleware>();
    })
    .Build();

var environment = host.Services.GetService<IHostEnvironment>();
if (environment.IsDevelopment())
{
    var db = host.Services.GetRequiredService<ElysianContext>();
    await db.Database.MigrateAsync();
}

await host.RunAsync();
