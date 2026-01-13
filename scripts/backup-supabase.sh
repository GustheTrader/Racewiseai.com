#!/bin/bash
# Backup script for Supabase data before reset
# Run this if you have important data to preserve

echo "🔄 Starting Supabase backup..."

# Create backup directory
mkdir -p backups/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

# Backup database schema and data
echo "📦 Backing up database..."
npx supabase db dump -f "$BACKUP_DIR/schema.sql" --schema public
npx supabase db dump -f "$BACKUP_DIR/data.sql" --data-only

# Backup edge functions
echo "📦 Backing up edge functions..."
cp -r supabase/functions "$BACKUP_DIR/functions_backup"

# Backup config
echo "📦 Backing up configuration..."
cp supabase/config.toml "$BACKUP_DIR/config.toml.backup"

echo "✅ Backup complete! Saved to: $BACKUP_DIR"
echo "To restore later, use: psql -f $BACKUP_DIR/data.sql"
