using CapitolSharp.Congress.Bills.BillDetails;
using CapitolSharp.Congress.Bills.BillListAll;
using CapitolSharp.Congress.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elysian.Application.Interfaces
{
    public interface ICongressService
    {
        Task<BillListAllResponse> GetBillsAsync(int offset = 0, int limit = 20,
            DateTime? fromDateTime = null, DateTime? toDateTime = null, string? sort = "updateDate",
            SortByDirection direction = SortByDirection.DESC);
        Task<BillDetailsResponse> GetBillAsync(int congress, BillType billType, int billNumber);
    }
}
