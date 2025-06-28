# Database Migrations

This directory contains database migration files for the restaurant menu API.

## Overview

The migration system uses [golang-migrate](https://github.com/golang-migrate/migrate) to manage database schema changes in a production-ready way.

## File Naming Convention

Migration files follow the format: `{version}_{name}.{direction}.sql`

- `version`: 6-digit timestamp or sequential number (e.g., `000001`)
- `name`: Descriptive name of the migration (e.g., `initial_schema`)
- `direction`: Either `up` (apply migration) or `down` (rollback migration)

Examples:
- `000001_initial_schema.up.sql`
- `000001_initial_schema.down.sql`
- `000002_add_user_table.up.sql`
- `000002_add_user_table.down.sql`

## Usage

### Running Migrations

```bash
# Run all pending migrations
make db-migrate

# Check current version
make db-migrate-version

# Rollback all migrations
make db-migrate-down

# Migrate to specific version
make db-migrate-goto VERSION=1

# Run specific number of migration steps
make db-migrate-steps STEPS=2    # Forward
make db-migrate-steps STEPS=-1   # Backward
```

### Creating New Migrations

```bash
# Create a new migration
make db-migrate-create NAME=add_user_table

# This creates:
# - migrations/000002_add_user_table.up.sql
# - migrations/000002_add_user_table.down.sql
```

### Emergency Operations

```bash
# Force migration to specific version (use with caution)
make db-migrate-force VERSION=1

# Drop all tables (DANGEROUS - will prompt for confirmation)
make db-migrate-drop

# Reset database (drop and recreate with migrations)
make db-reset
```

## Best Practices

1. **Always create both up and down migrations**: Every `.up.sql` file must have a corresponding `.down.sql` file

2. **Test migrations thoroughly**: Test both the up and down migrations in a development environment

3. **Keep migrations atomic**: Each migration should be a single, cohesive change

4. **Use transactions**: Wrap DDL statements in transactions when possible:
   ```sql
   BEGIN;
   -- Your migration SQL here
   COMMIT;
   ```

5. **Add indexes carefully**: Create indexes concurrently in production:
   ```sql
   CREATE INDEX CONCURRENTLY idx_name ON table_name(column_name);
   ```

6. **Backup before migrations**: Always backup production databases before running migrations

7. **Review migrations**: Have migrations reviewed before applying to production

## Migration Files

### 000001_initial_schema
- **Purpose**: Creates the initial database schema for the restaurant menu system
- **Tables**: restaurant_infos, operating_hours, content_sections, categories, sub_categories, items
- **Features**: Includes indexes, triggers for updated_at timestamps, and proper foreign key constraints

## Production Deployment

In production environments:

1. **Disable auto-migration**: The application automatically disables GORM auto-migration in production mode
2. **Run migrations manually**: Use `make db-migrate` before deploying new application versions
3. **Monitor migration status**: Use `make db-migrate-version` to check the current state
4. **Plan rollbacks**: Always have a rollback plan and test rollback migrations

## Troubleshooting

### Dirty Migration State

If a migration fails and leaves the database in a "dirty" state:

```bash
# Check current version and dirty state
make db-migrate-version

# Force to a clean version (use the last known good version)
make db-migrate-force VERSION=1
```

### Migration Conflicts

When working in a team and migration conflicts occur:

1. Coordinate with team members
2. Create a new migration to resolve conflicts
3. Never modify existing migration files that have been applied

### Rollback Issues

If a rollback migration fails:

1. Check the down migration SQL
2. Manually fix the database state if necessary
3. Use `make db-migrate-force` to set the correct version
4. Fix the down migration for future use