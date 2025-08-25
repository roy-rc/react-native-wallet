import express from 'express';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';
import transactionsRoute from './routes/transactionsRoute.js';
import job from "./config/cron.js";

dotenv.config();

const app = express();

// Start the cron job
if(process.env.MODE_ENV === "production") job.start()  

const PORT = process.env.PORT || 5001;   

app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

// Middleware to parse JSON bodies
app.use(rateLimiter); // Apply rate limiting middleware to all routes

app.use(express.json()); 

// custom middleware to log each request
app.use((req,res,next) => {
    console.log("method hit:",req.method);
    next();
});

// Routes
app.use('/api/transaction', transactionsRoute);

initDB().then(() => {
  console.log('Database is ready');
  app.listen(PORT, () => {
    console.log('Server is running on port:', PORT);
    });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
});
