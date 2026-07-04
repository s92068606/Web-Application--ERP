using ERP.Application.Models;
using ERP.Domain.Entities;

namespace ERP.Application.Interfaces;

public interface IOrderService
{
    Task<IReadOnlyList<ClientDto>> GetClientsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ItemDto>> GetItemsAsync(CancellationToken cancellationToken = default);
    Task<SalesOrderDto?> GetOrderAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesOrderDto>> GetOrdersAsync(CancellationToken cancellationToken = default);
    Task<SalesOrderDto> SaveOrderAsync(SalesOrderDto order, CancellationToken cancellationToken = default);
}
