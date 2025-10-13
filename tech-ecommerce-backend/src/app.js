import express from 'express';
import cors from 'cors';
import productRoutes from './routes/product.routes.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ok : true, message : "Server is running"})
})

app.use('/api/products', productRoutes);

app.use((err, req, res, next) => {
    console.log(err)
    res.status(err.status || 500).json({ message : err.message || 'Internal Server Error'})
})

export default app