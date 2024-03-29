﻿using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.Azure.Functions.Worker;
using System.Security.Claims;
using Microsoft.Extensions.DependencyInjection;
using Elysian.Application.Interfaces;

namespace Elysian.Infrastructure.Identity
{
    public class ClaimsPrincipalMiddleware : IFunctionsWorkerMiddleware
    {
        public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
        {
            // determine the type, the default is Microsoft.Azure.Functions.Worker.Context.Features.GrpcFunctionBindingsFeature
            (Type featureType, object featureInstance) = context.Features.SingleOrDefault(x => x.Key.Name == "IFunctionBindingsFeature");

            // find the input binding of the function which has been invoked and then find the associated parameter of the function for the data we want
            var inputData = featureType.GetProperties().SingleOrDefault(p => p.Name == "InputData")?.GetValue(featureInstance) as IReadOnlyDictionary<string, object>;
            var requestData = inputData?.Values.SingleOrDefault(obj => obj is HttpRequestData) as HttpRequestData;

            if (requestData?.ParsePrincipal() is ClaimsPrincipal principal)
            {
                // set the principal on the accessor from DI
                var accessor = context.InstanceServices.GetRequiredService<IClaimsPrincipalAccessor>();
                accessor.Principal = principal;
            }

            await next(context);
        }
    }
}
