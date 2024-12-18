const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;

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

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
