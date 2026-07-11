-- Additive, non-breaking column.
-- Nullable initially to avoid breaking existing 26 rows.
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Inventory')
    AND name = 'GoogleMapUrl'
)
BEGIN
    ALTER TABLE dbo.Inventory
    ADD GoogleMapUrl NVARCHAR(500) NULL;
END