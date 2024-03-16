using Azure.Identity;
using Elysian.Application.Interfaces;
using Elysian.Infrastructure.Context;
using Elysian.Infrastructure.Identity;
using Elysian.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureAppConfiguration((context, config) =>
    {
        if (context.HostingEnvironment.IsDevelopment())
        {
            config.AddUserSecrets<Program>();
        }
        else
        {
            // TODO: FunctionApp has access policy but cannot access keyvault
            //var builtConfig = config.Build();
            //var keyVaultUrl = builtConfig.GetValue<Uri>("KeyVaultUri");
            //config.AddAzureKeyVault(keyVaultUrl, new DefaultAzureCredential());
        }
    })
    .ConfigureServices((hostContext, services) =>
    {
        services.AddHttpClient();
        services.AddSingleton<IClaimsPrincipalAccessor, ClaimsPrincipalAccessor>();
        services.AddSingleton<IGitHubService, GitHubService>();
        services.AddSingleton<IWordPressService, WordPressService>();
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
