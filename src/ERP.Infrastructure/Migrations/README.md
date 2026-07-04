This folder contains EF Core migration artifacts created manually because the dotnet SDK/migration CLI is not available in the environment.

Files:
- InitialCreate.cs - the migration that creates Clients, Items, SalesOrders, SalesOrderItems tables.
- ERP.InfrastructureModelSnapshot.cs - model snapshot for the current model state.

Usage:
If you have .NET SDK and dotnet-ef locally, place these files under `src/ERP.Infrastructure/Migrations` and run:

```powershell
cd src/ERP.API
dotnet ef migrations add InitialCreate -p ..\ERP.Infrastructure -s .\ERP.API.csproj
dotnet ef database update -p ..\ERP.Infrastructure -s .\ERP.API.csproj
```
