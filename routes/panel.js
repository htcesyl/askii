const express = require('express');
const router = express.Router();
const multer = require('multer');

// Mock veri tabanı
const products = [
    { id: 1, name: 'Ürün 1', description: 'Ürün açıklaması', price: 50, image: '/images/default.jpg' },
    { id: 2, name: 'Ürün 2', description: 'Ürün açıklaması', price: 100, image: '/images/default.jpg' },
];

// Multer yapılandırması
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Görselleri kaydetmek için hedef klasör
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Dosya adını oluştur
    },
});
const upload = multer({ storage });

// Tüm ürünleri listeleme
router.get('/products', (req, res) => {
    res.json(products);
});

// Yeni ürün ekleme
router.post('/products', upload.single('image'), (req, res) => {
    const { name, description, price } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : '/images/default.jpg';

    const newProduct = {
        id: products.length + 1,
        name,
        description,
        price: parseFloat(price),
        image: imagePath,
    };

    products.push(newProduct);
    res.json(newProduct);
});

module.exports = router;
