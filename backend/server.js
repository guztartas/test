import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import products from './products.js';
import stockPrice from './stock-price.js';

const app = express();
const PORT = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/stock-price/:sku', (req, res) => {
    const sku = req.params.sku;
    const data = stockPrice[sku];
    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ error: 'SKU not found' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
