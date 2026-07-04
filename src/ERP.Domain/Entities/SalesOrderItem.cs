using System.Text.Json.Serialization;

namespace ERP.Domain.Entities;

public class SalesOrderItem
{
    public int Id { get; set; }
    public int SalesOrderId { get; set; }
    public int? ItemId { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string ItemDescription { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TaxRate { get; set; }
    public decimal ExclAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal InclAmount { get; set; }
    public string? Note { get; set; }

    [JsonIgnore]
    public SalesOrder? SalesOrder { get; set; }
}
