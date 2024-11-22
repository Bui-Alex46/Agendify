CREATE DATABASE Agendify;


-- Create user tables
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100), -- Assuming you're storing a hashed password
);


CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE, 
    title VARCHAR(255) NOT NULL,
    deadline TIMESTAMP,
    priority INT, 
    notes TEXT,
    status BOOLEAN DEFAULT FALSE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert into users table
INSERT INTO users (username, password)
VALUES ('user_1', 'password123');


-- Insert into events table
INSERT INTO events (user_id, title, deadline, priority, notes, status)
VALUES (1, 'Finish project setup', '2024-12-31 23:59:59', 1, 'Set up PostgreSQL database', FALSE);


DELETE FROM events
WHERE user_id = 2
  AND event_id BETWEEN 43 AND 51;


CREATE TABLE "session" (
    "sid" VARCHAR NOT NULL PRIMARY KEY,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL
)
WITH (OIDS=FALSE);


CREATE INDEX "IDX_session_expire" ON "session" ("expire");