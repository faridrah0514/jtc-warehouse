-- Create the main user and set password
CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED BY 'admin';

-- Grant full privileges on the main and shadow databases to accadmin
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;

-- Apply changes immediately
FLUSH PRIVILEGES;

-- Create the main database if it doesn’t already exist
CREATE DATABASE IF NOT EXISTS jtc_warehouse;

