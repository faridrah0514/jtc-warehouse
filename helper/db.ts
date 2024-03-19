import mysql, { ConnectionOptions } from 'mysql2';

var connection: ConnectionOptions = {
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'jtc_warehouse'
}

export function openDB() {
    return mysql.createConnection(connection).promise()
}