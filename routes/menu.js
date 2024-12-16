const express = require("express");
const router = express.Router();
const Restaurant = require("../models/product");

// Menü öğelerini getiren route
router.get("/menu", async (req, res) => {
  try {
    const menuItems = await Restaurant.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Veri getirilirken hata oluştu." });
  }
});

module.exports = router;
