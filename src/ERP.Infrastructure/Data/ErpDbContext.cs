using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.Infrastructure.Data;

public class ErpDbContext : DbContext
{
    public ErpDbContext(DbContextOptions<ErpDbContext> options) : base(options)
    {
    }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();
    public DbSet<SalesOrderItem> SalesOrderItems => Set<SalesOrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SalesOrder>()
            .HasMany(o => o.Items)
            .WithOne(i => i.SalesOrder)
            .HasForeignKey(i => i.SalesOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Item>()
            .Property(i => i.UnitPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<SalesOrder>()
            .Property(o => o.TotalExclAmount).HasPrecision(18, 2);
        modelBuilder.Entity<SalesOrder>()
            .Property(o => o.TotalTaxAmount).HasPrecision(18, 2);
        modelBuilder.Entity<SalesOrder>()
            .Property(o => o.TotalInclAmount).HasPrecision(18, 2);

        modelBuilder.Entity<SalesOrderItem>()
            .Property(i => i.UnitPrice).HasPrecision(18, 2);
        modelBuilder.Entity<SalesOrderItem>()
            .Property(i => i.ExclAmount).HasPrecision(18, 2);
        modelBuilder.Entity<SalesOrderItem>()
            .Property(i => i.TaxAmount).HasPrecision(18, 2);
        modelBuilder.Entity<SalesOrderItem>()
            .Property(i => i.InclAmount).HasPrecision(18, 2);
        modelBuilder.Entity<SalesOrderItem>()
            .Property(i => i.TaxRate).HasPrecision(5, 2);
    }
}
