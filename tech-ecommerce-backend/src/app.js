import express from 'express';
import cors from 'cors';
import productRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js';
import errorMiddleware from './middleware/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ok : true, message : "Server is running"})
})

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
  res.status(404).json({ success:false, message: 'Route not found' });
});

app.use(errorMiddleware)

export default app