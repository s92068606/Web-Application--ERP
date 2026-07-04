namespace ERP.Application.Models;

public record ClientDto(int Id, string Name, string AddressLine1, string? AddressLine2, string City, string State, string PostalCode, string Country, string? Phone, string? Email);

public record ItemDto(int Id, string Code, string Description, decimal UnitPrice);

public record SalesOrderItemDto(int Id, int? ItemId, string ItemCode, string ItemDescription, decimal UnitPrice, int Quantity, decimal TaxRate, decimal ExclAmount, decimal TaxAmount, decimal InclAmount, string? Note);

public record SalesOrderDto(int Id, string OrderNumber, DateTime OrderDate, int CustomerId, string CustomerName, string AddressLine1, string? AddressLine2, string City, string State, string PostalCode, string Country, string? Notes, decimal TotalExclAmount, decimal TotalTaxAmount, decimal TotalInclAmount, IReadOnlyList<SalesOrderItemDto> Items);
