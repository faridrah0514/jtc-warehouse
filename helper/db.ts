import mysql, { ConnectionOptions } from 'mysql2';

var connection: ConnectionOptions = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PWD,
    database: process.env.MYSQL_DATABASE,
    port: 3306,
    // host: "1eh.h.filess.io",
    // user: "jtcwarehouse_lovelylow",
    // password: "2b5f3545ab6d989b53b3dc86b0aa0c4c4eca46cc",
    // database: "jtcwarehouse_lovelylow",
    // port: 3306,

}

export function openDB() {
    return mysql.createConnection(connection).promise()
}