using ERP.Application.Interfaces;
using ERP.Application.Models;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SalesOrderDto>>> GetOrders(CancellationToken cancellationToken)
    {
        var orders = await _orderService.GetOrdersAsync(cancellationToken);
        return Ok(orders);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SalesOrderDto>> GetOrder(int id, CancellationToken cancellationToken)
    {
        var order = await _orderService.GetOrderAsync(id, cancellationToken);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpGet("clients")]
    public async Task<ActionResult<IReadOnlyList<ClientDto>>> GetClients(CancellationToken cancellationToken)
    {
        var clients = await _orderService.GetClientsAsync(cancellationToken);
        return Ok(clients);
    }

    [HttpGet("items")]
    public async Task<ActionResult<IReadOnlyList<ItemDto>>> GetItems(CancellationToken cancellationToken)
    {
        var items = await _orderService.GetItemsAsync(cancellationToken);
        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<SalesOrderDto>> SaveOrder([FromBody] SalesOrderDto order, CancellationToken cancellationToken)
    {
        var saved = await _orderService.SaveOrderAsync(order, cancellationToken);
        return Ok(saved);
    }
}
