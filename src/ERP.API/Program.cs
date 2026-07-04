using ERP.Application.Interfaces;
using ERP.Application.Services;
using ERP.Infrastructure.Data;
using ERP.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ErpDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddAutoMapper(typeof(ERP.Application.MappingProfile));

builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ErpDbContext>();
    db.Database.Migrate();
    SeedData(db);
}

app.Run();

static void SeedData(ErpDbContext db)
{
    if (!db.Clients.Any())
    {
        db.Clients.AddRange(
            new ERP.Domain.Entities.Client { Name = "Apex Traders", AddressLine1 = "123 Main Street", City = "Colombo", State = "Western", PostalCode = "00100", Country = "Sri Lanka", Phone = "0112345678", Email = "ops@apex.com" },
            new ERP.Domain.Entities.Client { Name = "Blue Ocean Ltd", AddressLine1 = "45 Galle Road", City = "Galle", State = "Southern", PostalCode = "80000", Country = "Sri Lanka", Phone = "0912345678", Email = "sales@blueocean.com" },
            new ERP.Domain.Entities.Client { Name = "Northwind Retail", AddressLine1 = "10 Temple Road", City = "Kandy", State = "Central", PostalCode = "20000", Country = "Sri Lanka", Phone = "0812345678", Email = "accounts@northwind.lk" }
        );
    }

    if (!db.Items.Any())
    {
        db.Items.AddRange(
            new ERP.Domain.Entities.Item { Code = "ITM-001", Description = "Laptop", UnitPrice = 250000m },
            new ERP.Domain.Entities.Item { Code = "ITM-002", Description = "Monitor", UnitPrice = 55000m },
            new ERP.Domain.Entities.Item { Code = "ITM-003", Description = "Keyboard", UnitPrice = 7500m },
            new ERP.Domain.Entities.Item { Code = "ITM-004", Description = "Mouse", UnitPrice = 3000m }
        );
    }

    db.SaveChanges();
}
