import express from 'express'
import type {Express, Request, Response, NextFunction} from 'express'
import cors from 'cors' //cross-origin resource sharing; security mechanism, controls whether a web page from one origin(localhost:5173) can make requests to a different origin (localhost:3000)
import dotenv from 'dotenv'
import {testDatabaseConnection} from './config/db.js' //add .js to avoid import error

dotenv.config(); //load environment variables from .env

//initialize Express application instance
const app: Express = express();
const PORT = process.env.PORT || 5000;

//1.Middleware Configuration

//CORS (Cross-Origin Resource Sharing); allows frontend to communicate with backend server
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, //allows sending cookies and auuthorization headers
}));

app.use(express.json()); //express middleware; parses incoming JSON payload bodies 

//2. Health Check Route

//diagnostic route to check if the Node.ts server is alive and responding
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        message: 'Hotel App API server is healthy',
        timestamp: new Date().toISOString(),
    });
});

//3. Global Error Handling Middeware; catches unhandled errors thrown inside API route handlers and returns clear JSON
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Server Error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occured.'
    });
});

//4. Server Initialization
const startServer = async (): Promise<void> => {
    await testDatabaseConnection(); //verify PostgreSQL connection before starting HTTP server

    //start express server listener
    app.listen(PORT, () => {
        console.log(`Hotel API server running on http://localhost:${PORT}`)
    });
};

startServer();