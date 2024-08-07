﻿using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

namespace Elysian.Application.Behaviors
{
    public class PerformanceBehavior<TRequest, TResponse>(
        ILogger<TRequest> logger)
         : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly Stopwatch _timer = new Stopwatch();

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            _timer.Start();

            var response = await next();

            _timer.Stop();

            var elapsedMilliseconds = _timer.ElapsedMilliseconds;

            if (elapsedMilliseconds > 500)
            {
                var requestName = typeof(TRequest).Name;

                logger.LogWarning(
                    $"Application Long Running Request: {requestName} " +
                    $"({elapsedMilliseconds} milliseconds)" +
                    $"{request}");
            }

            return await Task.FromResult(response);
        }
    }
}
