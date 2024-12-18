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



  //panel için
  const express = require('express');
  const server = express(); // 'app' yerine 'server' olarak yeniden adlandırıldı.
  const panelRoutes = require('./routes/panel');
  
  server.use(express.static('public'));
  server.use('/api', panelRoutes);
  
  server.listen(3000, () => {
      console.log('Server çalışıyor: http://localhost:3000');
  });
  
  

  const panelRoutes = require('./routes/panel');
  app.use('/api', panelRoutes);
  