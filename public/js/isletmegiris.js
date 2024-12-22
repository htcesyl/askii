async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('http://localhost:3002/api/institution/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
            // Kurum bilgilerini localStorage'a kaydet
            localStorage.setItem('institution', JSON.stringify(result.data.institution));
            
            alert("Giriş başarılı!");
            // Başarılı girişten sonra yönlendirme
            window.location.href = '../views/panel.html';
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
    const name = form.querySelector('input[placeholder="İşletme Adı"]').value;
    const type = form.querySelector('input[placeholder="Kategorisi(Mağaza veya Restoran)"]').value;
    const email = form.querySelector('input[placeholder="İşletme E-posta"]').value;
    const phone = form.querySelector('input[placeholder="Telefon Numarası(+90)"]').value;
    const password = form.querySelector('input[placeholder="Şifre"]').value;
    const passwordConfirm = form.querySelector('input[placeholder="Şifre(Tekrar)"]').value;

    // Şifre kontrol
    if (password !== passwordConfirm) {
        alert("Şifreler eşleşmiyor!");
        return;
    }

    // API'ye gönderilecek veri
    const data = {
        name,
        email,
        password,
        phone,
        type: type.toLowerCase(), // "restoran" veya "magaza" olarak kaydedilecek
        address: {} // Boş adres objesi, daha sonra eklenebilir
    };

    try {
        const response = await fetch('http://localhost:3001/api/institution/register', {
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
