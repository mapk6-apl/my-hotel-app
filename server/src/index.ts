import express from 'express'
import type {Express, Request, Response, NextFunction} from 'express'
import cors from 'cors' //cross-origin resource sharing; security mechanism, controls whether a web page from one origin(localhost:5173) can make requests to a different origin (localhost:3000)
import dotenv from 'dotenv'
import {testDatabaseConnection} from './config/db.js' //add .js to avoid import error

dotenv.config(); //load environment variables from .env

//initialize Express application instance
const app: Express = express();
const PORT = process.env.PORT || 5000;

//middleware configuration

//CORS (Cross-Origin Resource Sharing); allows frontend to communicate with backend server
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, //allows sending cookies and auuthorization headers
}));

app.use(express.json()); //express middleware; parses incoming JSON payload bodies 
