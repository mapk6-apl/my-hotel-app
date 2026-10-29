import type {Express, Request, Response, NextFunction} from 'express'
import cors from 'cors' //cross-origin resource sharing; security mechanism, controls whether a web page from one origin(localhost:5173) can make requests to a different origin (localhost:3000)
import dotenv from 'dotenv'
import {testDatabaseConnection} from './config/db.js' //add .js to avoid import error