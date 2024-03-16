using Elysian.Application.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elysian.Application.Interfaces
{
    public interface IWordPressService
    {
        Task<WordPressContent> GetWordPressContentAsync();
    }
}
