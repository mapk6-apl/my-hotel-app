import {Pool} from 'pg'
import dotenv from 'dotenv'

//loading the environment variables from the .env fie into process.env
dotenv.config();

//PostgreSQL connection pool configuration; a pool maintains a group of reusable database connections
export const pool = new Pool ({
    connectionString: process.env.DATABASE_URL, //ex. postgresql://user:password@localhost:5432/hotel_db
    max: 20, //max number of active clients in pool
    idleTimeoutMillis: 30000, //time (in ms) a client can remain idle before being closed
    connectionTimeoutMillis: 2000, //time (in ms) to wait before timing out when connecting
});

//event listener for background pool errors; if idle client in pool encounters error, callback catches it so my node.ts server doesnt crash silently
pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle PostgreSQL client:', err)
    process.exit(-1); //exit process with failure code
});

//helper function to test and verify database connectivity
export const testDatabaseConnection = async (): Promise<void> => {
    try {
        const client = await pool.connect(); //we acquire a test client from the pool
        const result = await client.query('SELECT NOW()'); //execute simple query that returns current time from PostgreSQL server
        console.log('PostgreSQL connected successfully at:', result.rows[0].now);
        client.release(); //release client back into pool for incoming API requests 
    } catch (error) {
        console.error('Failed to connect to PostgreSQL database:', error);
        process.exit(1);
    }
}
