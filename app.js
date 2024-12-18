const express = require('express');
const mongoose = require('mongoose');
const restaurantRoutes = require('./routes/restaurants');

const app = express();

// Middleware
app.use(express.json());
app.use('/api/restaurants', restaurantRoutes); // Yeni eklediğimiz route

const PORT = process.env.PORT || 3000;

// MongoDB Bağlantısı
mongoose
  .connect('MONGODB_CONNECTION_STRING', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor`));
  })
  .catch((err) => console.log('MongoDB bağlantısı başarısız:', err));
