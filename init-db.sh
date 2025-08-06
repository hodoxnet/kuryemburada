#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER kurye WITH PASSWORD 'kurye123' CREATEDB;
    CREATE DATABASE kurye_db OWNER kurye;
    GRANT ALL PRIVILEGES ON DATABASE kurye_db TO kurye;
EOSQL