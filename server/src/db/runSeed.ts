import fs from 'fs'; 
import path from 'path'; 
import { pool } from '../config/db.js'; 


//Reads an SQL file from the current directory and executes it against PostgreSQL pool 
const runSqlFile = async (fileName: string) => { 
    const filePath = path.join(process.cwd(), 'src', 'db', fileName); 
    const sql = fs.readFileSync(filePath, 'utf8'); 
    await pool.query(sql); 
};

const setupDatabase = async () => { 
    if (process.env.NODE_ENV === 'production') {
        console.error('Refusing to run the destructive schema/seed script in production. Use npm run migrate:prod.');
        process.exitCode = 1;
        return;
    }
    try { console.log('1/2 Creating database tables from schema.sql...'); 
        await runSqlFile('schema.sql'); 
        console.log('Tables created successfully!'); 
        
        console.log('2/2 Populating Break-Away Hotels seed data from seed.sql...');
        await runSqlFile('seed.sql'); 
        console.log('Database seeded successfully!'); 
        
        process.exit(0); 
    } catch (error) { 
        console.error('Database setup failed:', error); 
        process.exit(1); 
    } 
}; 

setupDatabase();