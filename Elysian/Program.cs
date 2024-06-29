using Elysian.Application;
using Elysian.Infrastructure;
using Elysian.Infrastructure.Context;
using Elysian.Infrastructure.Identity;
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
    })
    .ConfigureServices((hostContext, services) =>
    {
        services.AddInfrastructure(hostContext.Configuration);
        services.AddApplication();
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
