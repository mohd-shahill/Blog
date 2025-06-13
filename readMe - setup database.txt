how to set up the MySQL database required to run the blog system.

1. create a database

CREATE DATABASE blog_db;


2. create the "posts" table

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


3. make an .env file

DB_HOST=localhost
DB_USER=mysql_username
DB_PASSWORD=mysql_password
DB_NAME=blog_db
PORT=3000
