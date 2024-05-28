using Elysian.Application.Extensions;
using Elysian.Application.Interfaces;
using Elysian.Application.Models;
using Elysian.Domain.Customization;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using NJsonSchema;
using NJsonSchema.CodeGeneration.CSharp;
using NJsonSchema.CodeGeneration.TypeScript;
using System.Data;
using System.Net;
using System.Text;

namespace Elysian
{
    public class CodeFunctions(ILogger<CodeFunctions> logger)
    {
        [Function("CodeGeneration")]
        public async Task<HttpResponseData> GenerateCode([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            var generateCodeRequest = await req.DeserializeBodyAsync<CodeGenerationRequest>();
            try
            {
                var jsonSchema = JsonSchema.FromSampleJson(generateCodeRequest.SampleJson);

                string code;
                if (generateCodeRequest.Language.Equals("typescript", StringComparison.InvariantCultureIgnoreCase))
                {
                    var generator = new TypeScriptGenerator(jsonSchema);

                    var typescriptCode = new StringBuilder();
                    typescriptCode.AppendLine("/* eslint-disable prefer-const */");
                    typescriptCode.AppendLine("/* eslint-disable no-var */");
                    typescriptCode.AppendLine("/* eslint-disable no-prototype-builtins */");
                    typescriptCode.AppendLine();
                    typescriptCode.AppendLine(generator.GenerateFile(generateCodeRequest.ResponseName));
                    code = typescriptCode.ToString();
                }
                else
                {
                    var generator = new CSharpGenerator(jsonSchema, new CSharpGeneratorSettings
                    {
                        Namespace = $"{generateCodeRequest.Namespace}.{generateCodeRequest.ResponseName}",
                        RequiredPropertiesMustBeDefined = true,
                        GenerateOptionalPropertiesAsNullable = true,
                        PropertyNameGenerator = new PascalCasePropertyNameGenerator()
                    });
                    code = generator.GenerateFile(generateCodeRequest.ResponseName);
                }

                var content = new
                {
                    code
                };
                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/json; charset=utf-8");
                await response.WriteStringAsync(JsonConvert.SerializeObject(content));

                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception occurred getting generated code content.");
                return await req.WriteFailureResponseAsync(HttpStatusCode.InternalServerError, "Failed to process generate code request .");
            }
        }
    }
}
