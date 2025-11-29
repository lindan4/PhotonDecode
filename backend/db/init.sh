#!/bin/bash
set -e

# Create the test database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE photon_decode_test;
EOSQL

# ---- Schema for main database ----
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE TABLE image_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        extracted_text VARCHAR(255),
        extraction_success BOOLEAN,
        quality VARCHAR(50),
        original_image_path TEXT NOT NULL,
        thumbnail_path TEXT,
        image_size INTEGER,
        image_dimensions VARCHAR(50),
        status VARCHAR(50) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX idx_extracted_text ON image_submissions(extracted_text);
    CREATE INDEX idx_created_at ON image_submissions(created_at DESC);
EOSQL

# ---- Schema for test database ----
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "photon_decode_test" <<-EOSQL
    CREATE TABLE image_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        extracted_text VARCHAR(255),
        extraction_success BOOLEAN,
        quality VARCHAR(50),
        original_image_path TEXT NOT NULL,
        thumbnail_path TEXT,
        image_size INTEGER,
        image_dimensions VARCHAR(50),
        status VARCHAR(50) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX idx_extracted_text ON image_submissions(extracted_text);
    CREATE INDEX idx_created_at ON image_submissions(created_at DESC);
EOSQL