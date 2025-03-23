#!/bin/bash

# Database configuration
DB_NAME="lmspms_db"
DB_USER="root"
DB_PASSWORD="root"

# Create database if it doesn't exist
mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

# Run schema
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < ./config/schema.sql

echo "Database initialization complete."