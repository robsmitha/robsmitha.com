using Elysian.Application.Features.Financial.Models;
using Elysian.Application.Interfaces;
using MediatR;

namespace Elysian.Application.Features.Financial.Commands
{
    public class SetTransactionCategoryCommand(string transactionId, int categoryId, int budgetId) : IRequest<TransactionCategoryModel>
    {
        private string TransactionId { get; set; } = transactionId;
        private int CategoryId { get; set; } = categoryId;
        private int BudgetId { get; set; } = budgetId;

        public class Handler(ICategoryService categoryService, IClaimsPrincipalAccessor claimsPrincipalAccessor) : IRequestHandler<SetTransactionCategoryCommand, TransactionCategoryModel>
        {
            public async Task<TransactionCategoryModel> Handle(SetTransactionCategoryCommand request, CancellationToken cancellationToken)
            {
                return await categoryService.SetTransactionCategoryAsync(claimsPrincipalAccessor.UserId, request.TransactionId, request.CategoryId, request.BudgetId);
            }
        }
    }
}
