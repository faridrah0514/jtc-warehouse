import mysql, { ConnectionOptions } from 'mysql2';

var connection: ConnectionOptions = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PWD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_DBPORT ? parseInt(process.env.MYSQL_DBPORT) : 3306,
}

export function openDB() {
    return mysql.createConnection(connection).promise()
}