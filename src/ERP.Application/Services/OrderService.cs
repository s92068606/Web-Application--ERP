using ERP.Application.Interfaces;
using ERP.Application.Models;

namespace ERP.Application.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _repository;

    public OrderService(IOrderRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<ClientDto>> GetClientsAsync(CancellationToken cancellationToken = default)
        => _repository.GetClientsAsync(cancellationToken);

    public Task<IReadOnlyList<ItemDto>> GetItemsAsync(CancellationToken cancellationToken = default)
        => _repository.GetItemsAsync(cancellationToken);

    public Task<SalesOrderDto?> GetOrderAsync(int id, CancellationToken cancellationToken = default)
        => _repository.GetOrderAsync(id, cancellationToken);

    public Task<IReadOnlyList<SalesOrderDto>> GetOrdersAsync(CancellationToken cancellationToken = default)
        => _repository.GetOrdersAsync(cancellationToken);

    public Task<SalesOrderDto> SaveOrderAsync(SalesOrderDto order, CancellationToken cancellationToken = default)
        => _repository.SaveOrderAsync(order, cancellationToken);
}
