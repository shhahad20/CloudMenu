import mysql from 'mysql';
import 'dotenv/config';
import { dev } from './index.js';
export const connectDB = mysql.createConnection({
    host: dev.db.db_host,
    user: dev.db.db_user,
    password: dev.db.db_password,
    database: dev.db.db_database,
    connectTimeout: 20000,
});
// connectDB.connect(error => {
//     if (error) {
//       console.error('Database connection failed:', error.stack);
//       return;
//     }
//     console.log('Connected to database.');
//   });
