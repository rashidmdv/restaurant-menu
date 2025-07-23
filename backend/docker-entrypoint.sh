#!/bin/sh
set -e

echo "Starting restaurant menu API..."

# Function to check if postgres is ready
wait_for_postgres() {
    echo "Waiting for PostgreSQL to be ready..."
    while ! nc -z ${DB_HOST:-postgres} ${DB_PORT:-5432}; do
        sleep 1
    done
    echo "PostgreSQL is ready!"
}

# Function to run migrations
run_migrations() {
    echo "Running database migrations..."
    ./migrate -command=up
    if [ $? -eq 0 ]; then
        echo "Migrations completed successfully"
    else
        echo "Migration failed"
        exit 1
    fi
}

# Function to seed database (optional)
seed_database() {
    if [ "$RUN_SEED" = "true" ]; then
        echo "Seeding database..."
        ./seed
        if [ $? -eq 0 ]; then
            echo "Database seeded successfully"
        else
            echo "Database seeding failed"
            exit 1
        fi
    fi
}

# Main execution
wait_for_postgres
run_migrations
seed_database

# Start the main application
echo "Starting the API server..."
exec ./main