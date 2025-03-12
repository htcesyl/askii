const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// CORS ayarları
app.use(cors({
    origin: ['http://127.0.0.1:5501', 'http://localhost:5501'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser middleware
app.use(bodyParser.json());

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/kullaniciKayit', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})
.then(() => console.log("MongoDB'ye başarıyla bağlanıldı"))
.catch((err) => console.log("MongoDB bağlantı hatası:", err));

// Kullanıcı modelini oluştur
const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
}));

// Kullanıcı kaydı
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (password !== req.body.confirmPassword) {
        return res.status(400).send('Şifreler uyuşmuyor!');
    }

    // Şifreyi şifreleyelim
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcıyı veritabanına kaydet
    const user = new User({ name, email, password: hashedPassword });
    try {
        await user.save();
        res.status(200).send('Başarıyla kayıt oldunuz. Şimdi giriş yapabilirsiniz.');
    } catch (err) {
        res.status(400).send('Kullanıcı kaydı sırasında hata oluştu.');
    }
});

// Kullanıcı girişi
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send('E-posta veya şifre hatalı.');
    }

    // Şifreyi kontrol et
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).send('E-posta veya şifre hatalı.');
    }

    res.status(200).send('Giriş başarılı! Anasayfaya yönlendiriliyorsunuz.');
});

// Dosya yükleme endpoint'i
app.post('/api/upload/image', async (req, res) => {
    try {
        // Dosya yükleme işlemleri burada yapılacak
        res.json({ success: true, url: 'uploaded_image_url' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Ürün ekleme endpoint'i
app.post('/api/products/add', async (req, res) => {
    try {
        const { name, description, price, stock, category, institutionId, profileImageUrl } = req.body;
        
        // Ürün ekleme işlemleri burada yapılacak
        const newProduct = {
            name,
            description,
            price,
            stock,
            category,
            institutionId,
            profileImageUrl
        };
        
        res.json({ success: true, data: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
