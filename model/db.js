const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./vigilwatch.db');

// Use a UUID library for generating UUIDs (e.g., uuid)
const { v4: uuidv4 } = require('uuid');

db.serialize(() => {
    // Create 'users' table with UUID as primary key
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        national_id_number INTEGER UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        bio TEXT,
        profile_picture BLOB,
        cover_picture BLOB,
        followers INTEGER DEFAULT 0
    )`, (err) => {
        if (err) console.error('Error creating users table:', err);
    });

    // Create 'auth' table with UUID as primary key and foreign key reference to users
    db.run(`CREATE TABLE IF NOT EXISTS auth (
        id TEXT PRIMARY KEY,
        pseudo_name TEXT NOT NULL,
        phone INTEGER UNIQUE NOT NULL,
        user_id TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error('Error creating auth table:', err);
    });

    // Create 'incident_reports' table with UUID as primary key and foreign key reference to users
    db.run(`CREATE TABLE IF NOT EXISTS incident_reports (
        id TEXT PRIMARY KEY,
        incident_type TEXT NOT NULL,
        other_incident TEXT,
        images BLOB,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        trending BOOLEAN DEFAULT FALSE,
        trending_expiry DATETIME,
        user_id TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error('Error creating incident_reports table:', err);
    });
    db.run(`CREATE TABLE IF NOT EXISTS pending_incidents (
        id TEXT PRIMARY KEY,
        incident_type TEXT NOT NULL,
        other_incident TEXT,
        images BLOB,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        user_id TEXT,
        status TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error('Error creating incident_reports table:', err);
    });

    // Create 'notification' table with UUID as primary key and foreign key reference to users
    db.run(`CREATE TABLE IF NOT EXISTS notification (
        id TEXT PRIMARY KEY,
        notification TEXT,
        date_sent TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read INTEGER DEFAULT 0,
        user_id TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error('Error creating notification table:', err);
    });

    // Create 'messages' table with UUID as primary key and foreign key references to users
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        recipient_id TEXT,
        location TEXT,
        text TEXT,
        time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(recipient_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error('Error creating messages table:', err);
    });
    db.run(`CREATE TABLE IF NOT EXISTS incident_reactions (
        id TEXT PRIMARY KEY,
        likes INTEGER,
        comment TEXT,
        location TEXT,
        incident_id,
        user_id,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(incident_id) REFERENCES incident_reports(id)

    )`, (err) => {
        if (err) console.error('Error creating messages table:', err);
    });


// db.run(`ALTER TABLE incident_reports ADD COLUMN trending BOOLEAN DEFAULT FALSE
// `);
// db.run(`ALTER TABLE incident_reports ADD COLUMN trending_expiry DATETIME;
// `)
    // Only run this if you need to drop the 'users' table for testing purposes.
    // db.run(`DROP TABLE IF EXISTS users`, (err) => {
    //     if (err) console.error('Error dropping users table:', err);
    // });
});

module.exports = db;
