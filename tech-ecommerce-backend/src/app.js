const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');

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

module.exports = app