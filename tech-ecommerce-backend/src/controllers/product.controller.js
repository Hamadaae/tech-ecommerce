const Product = require('../models/Product');

export const getProducts = async (req,res) => {
    try{
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message : error.message || 'Internal Server Error'})
    }
}

export const getProductById = async (req,res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product) {
            return res.status(404).json({ message : 'Product not found'});
        }
        res.json(product);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message : error.message || 'Internal Server Error'})
    }
}

export const createProduct = async (req,res) => {
    try{
        const newProduct = new Product(req.body)
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message : error.message })
    }
}

export const updateProduct = async (req,res) => {
    try{
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new : true }
        )
        if(!updated) {
            return res.status(404).json({ message : 'Product not found'});
        }
        res.json(updated);
    }catch (error) {
        console.log(error);
        res.status(400).json({ message : error.message })
    }
}

export const deleteProduct = async (req,res) => {
    try{
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if(!deleted) {
            return res.status(404).json({ message : 'Product not found'});
        }
        res.json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message : error.message || 'Internal Server Error'})
    }
}