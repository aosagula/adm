#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- Create test database if it doesn't exist
    SELECT 'CREATE DATABASE adm_test'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'adm_test')\gexec

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE adm_database TO adm_user;
    GRANT ALL PRIVILEGES ON DATABASE adm_test TO adm_user;
EOSQL

echo "Database initialization completed successfully!"
