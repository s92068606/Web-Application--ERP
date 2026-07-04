-- Creates a non-privileged SQL login and user for the ErpDb database.
-- Run this in SQL Server Management Studio connected to your target server.

-- Change the password before running in production.
CREATE LOGIN app_user WITH PASSWORD = 'ChangeMe!123';
GO
USE [ErpDb];
CREATE USER app_user FOR LOGIN app_user;
-- Grant minimal permissions needed for the app; avoid db_owner in production.
EXEC sp_addrolemember N'db_datareader', N'app_user';
EXEC sp_addrolemember N'db_datawriter', N'app_user';
GO

-- Optional: grant execute on stored procedures if added later
-- GRANT EXECUTE TO app_user;
