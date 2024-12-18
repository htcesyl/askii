const express = require('express');
const router = express.Router();
const Institution = require('../models/institution'); // Restoran modeli
const Product = require('../models/product');         // Ürün modeli

// Restoran bilgileri ve menülerini döndürme
router.get('/:id', async (req, res) => {
  const { id } = req.params; // URL'den restoran ID'sini alıyoruz

  try {
    // Restoran bilgilerini getiriyoruz
    const restaurant = await Institution.findById(id).populate('products'); // İlgili ürünleri de getiriyoruz

    if (!restaurant) {
      return res.status(404).json({ message: "Restoran bulunamadı." });
    }

    res.json({
      name: restaurant.name,
      address: restaurant.address,
      openingHours: restaurant.openingHours,
      products: restaurant.products, // Restoranın menüleri
    });
  } catch (error) {
    console.error("Restoran verileri alınırken hata:", error);
    res.status(500).json({ message: "Veriler alınamadı.", error });
  }
});

module.exports = router;
