namespace ERP.Domain.Entities;

public class SalesOrder
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public decimal TotalExclAmount { get; set; }
    public decimal TotalTaxAmount { get; set; }
    public decimal TotalInclAmount { get; set; }
    public ICollection<SalesOrderItem> Items { get; set; } = new List<SalesOrderItem>();
}
