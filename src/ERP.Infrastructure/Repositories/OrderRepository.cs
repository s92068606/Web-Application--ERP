using AutoMapper;
using ERP.Application.Interfaces;
using ERP.Application.Models;
using ERP.Domain.Entities;
using ERP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERP.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly ErpDbContext _dbContext;
    private readonly IMapper _mapper;

    public OrderRepository(ErpDbContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ClientDto>> GetClientsAsync(CancellationToken cancellationToken = default)
    {
        var clients = await _dbContext.Clients.OrderBy(c => c.Name).ToListAsync(cancellationToken);
        return _mapper.Map<IReadOnlyList<ClientDto>>(clients);
    }

    public async Task<IReadOnlyList<ItemDto>> GetItemsAsync(CancellationToken cancellationToken = default)
    {
        var items = await _dbContext.Items.OrderBy(i => i.Description).ToListAsync(cancellationToken);
        return _mapper.Map<IReadOnlyList<ItemDto>>(items);
    }

    public async Task<SalesOrderDto?> GetOrderAsync(int id, CancellationToken cancellationToken = default)
    {
        var order = await _dbContext.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        return order is null ? null : _mapper.Map<SalesOrderDto>(order);
    }

    public async Task<IReadOnlyList<SalesOrderDto>> GetOrdersAsync(CancellationToken cancellationToken = default)
    {
        var orders = await _dbContext.SalesOrders
            .Include(o => o.Items)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync(cancellationToken);

        return _mapper.Map<IReadOnlyList<SalesOrderDto>>(orders);
    }

    public async Task<SalesOrderDto> SaveOrderAsync(SalesOrderDto orderDto, CancellationToken cancellationToken = default)
    {
        var order = _mapper.Map<SalesOrder>(orderDto);

        if (order.Id == 0)
        {
            _dbContext.SalesOrders.Add(order);
        }
        else
        {
            var existing = await _dbContext.SalesOrders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == order.Id, cancellationToken);

            if (existing is null)
            {
                throw new InvalidOperationException($"Sales order {order.Id} was not found.");
            }

            existing.OrderNumber = order.OrderNumber;
            existing.OrderDate = order.OrderDate;
            existing.CustomerId = order.CustomerId;
            existing.CustomerName = order.CustomerName;
            existing.AddressLine1 = order.AddressLine1;
            existing.AddressLine2 = order.AddressLine2;
            existing.City = order.City;
            existing.State = order.State;
            existing.PostalCode = order.PostalCode;
            existing.Country = order.Country;
            existing.Notes = order.Notes;
            existing.TotalExclAmount = order.TotalExclAmount;
            existing.TotalTaxAmount = order.TotalTaxAmount;
            existing.TotalInclAmount = order.TotalInclAmount;

            _dbContext.SalesOrderItems.RemoveRange(existing.Items);
            existing.Items = order.Items;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return _mapper.Map<SalesOrderDto>(order);
    }
}
