// By Junhui Huang
const schema = `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON t.typnamespace = n.oid
         WHERE t.typname = 'role_enum'
           AND n.nspname = 'public'
    )
    THEN
        CREATE TYPE role_enum AS ENUM ('professor', 'assistant', 'student');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON t.typnamespace = n.oid
         WHERE t.typname = 'session_enum'
           AND n.nspname = 'public'
    )
    THEN
        CREATE TYPE session_enum AS ENUM ('lecture', 'lab', 'discussion');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS verification_token
(
    identifier TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    token TEXT NOT NULL,
    PRIMARY KEY(identifier, token)
);

CREATE TABLE IF NOT EXISTS accounts
(
    id SERIAL,
    "userId" INTEGER NOT NULL,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    id_token TEXT,
    scope TEXT,
    session_state TEXT,
    token_type TEXT,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS users
(
    id SERIAL,
    name VARCHAR(255),
    email VARCHAR(255),
    "emailVerified" TIMESTAMPTZ,
    image TEXT,
    PRIMARY KEY(id),
    role role_enum NOT NULL DEFAULT 'student'
);

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    type session_enum NOT NULL,
    date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    secret1 VARCHAR(255) NOT NULL,
    secret2 VARCHAR(255) NOT NULL,
    secret3 VARCHAR(255) NOT NULL,
    secret4 VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS attendances (
    id SERIAL PRIMARY KEY,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    check_in_time TIMESTAMPTZ,
    UNIQUE (session_id, student_id)
);
`;

import { neon, Pool } from "@neondatabase/serverless"
let pool: Pool;

export function getPool(): Pool {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
        pool.query(schema).catch(err => {
            console.error('Error initializing database schema:', err);
        });
    }
    return pool;
}

export function getSQL() {
    return neon(`${process.env.DATABASE_URL}`);
}
