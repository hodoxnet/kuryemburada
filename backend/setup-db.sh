#!/bin/bash

echo "Setting up PostgreSQL database for Kurye Operasyon Sistemi..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null
then
    echo "PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Database configuration
DB_NAME="kuryemburadav1"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo "Creating database: $DB_NAME"

# Create database if it doesn't exist
psql -U $DB_USER -h $DB_HOST -p $DB_PORT -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "CREATE DATABASE $DB_NAME"

if [ $? -eq 0 ]; then
    echo "Database created or already exists: $DB_NAME"
    
    echo "Running Prisma migrations..."
    npm run prisma:migrate
    
    echo "Generating Prisma client..."
    npm run prisma:generate
    
    echo "Database setup completed successfully!"
else
    echo "Failed to create database. Please check your PostgreSQL configuration."
    exit 1
fi