using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elysian.Application.Models
{
    public record CodeGenerationRequest(string ResponseName, string Language, string Namespace, string SampleJson);
}
