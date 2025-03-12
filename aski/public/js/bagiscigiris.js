async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('http://localhost:3000/api/donor/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
            // Bağışçı bilgilerini localStorage'a kaydet
            localStorage.setItem('donor', JSON.stringify(result.data.donor));
            
            alert("Giriş başarılı!");
            // Başarılı girişten sonra anasayfa.html'e yönlendir
            window.location.href = 'anasayfa.html';
        } else {
            alert(result.message || "Giriş yapılırken bir hata oluştu!");
        }
    } catch (error) {
        console.error('Hata:', error);
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    // Form verilerini al
    const form = event.target;
    const name = form.querySelector('input[placeholder="Ad"]').value;
    const surname = form.querySelector('input[placeholder="Soyad"]').value;
    const email = form.querySelector('input[placeholder="E-posta"]').value;
    const phone = form.querySelector('input[placeholder="Telefon Numarası"]').value;
    const password = form.querySelector('input[placeholder="Şifre"]').value;
    const passwordConfirm = form.querySelector('input[placeholder="Şifre(Tekrar)"]').value;

    // Şifre kontrolü
    if (password !== passwordConfirm) {
        alert("Şifreler eşleşmiyor!");
        return;
    }

    // API'ye gönderilecek veri
    const data = {
        name,
        surname,
        email,
        password,
        phone,
        profileImageUrl: "" // Boş string olarak gönder
    };

    try {
        const response = await fetch('http://localhost:3000/api/donor/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Kayıt başarılı! Giriş yapabilirsiniz.");
            form.reset(); // Formu temizle
        } else {
            alert(result.message || "Kayıt sırasında bir hata oluştu!");
        }
    } catch (error) {
        console.error('Hata:', error);
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
}
