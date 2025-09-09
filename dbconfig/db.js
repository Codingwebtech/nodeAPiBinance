const mysql = require('mysql2');
require('dotenv').config()

const pool = mysql.createPool({
    host: process.env.DB_HOST_LOC,
    user: process.env.DB_USER_LOC,
    password: process.env.DB_PASSWORD_LOC,
    database: process.env.DATABASE_NAME_LOC,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});



// pool.getConnection(function (err, connection) {
//     if (err) throw err
//     try {
//         if (connection) {
//             console.log("My Database is connected NOW...!!!!!!!!!!!!!!")
//         }
//     } catch (err) {
//         console.log("Something went wrong. __Database NOT connected.....")
//     } finally {
//         pool.releaseConnection(connection);
//     }
// });

module.exports = pool;