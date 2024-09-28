// This is our js file for the database schema

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./vigilwatch.db');

db.serialize(() => {
    // Create 'users' table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        sex TEXT NOT NULL, 
        bio TEXT,
        profile_picture BLOB,
        cover_picture BLOB
    )`);

    // Create 'auth' table
    db.run(`CREATE TABLE IF NOT EXISTS auth (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        phone INTEGER UNIQUE NOT NULL,
        password TEXT NOT NULL,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS incident_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_type TEXT NOT NULL,      
    other_incident TEXT,  
    images BLOB,     
    date TEXT NOT NULL,               
    time TEXT NOT NULL,             
    description TEXT NOT NULL,        
    location TEXT NOT NULL,
    user_id INTEGER REFERENCES users       
);`);
db.run(`CREATE TABLE IF NOT EXISTS notification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notification TEXT,
    date_sent TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users
);`);


   
});
module.exports = db;