// DOM yüklendiğinde çalışacak kod
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(event) {
    event.preventDefault();
    
    try {
        const form = event.target;
        const email = form.querySelector('input[name="email"]').value;
        const password = form.querySelector('input[name="password"]').value;

        console.log('Giriş bilgileri:', { email }); // Debug için (şifreyi loglamıyoruz)

        const response = await fetch('http://localhost:3000/api/institution/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        console.log('Login response:', result); // Debug için

        if (!response.ok) {
            throw new Error(result.message || 'Giriş yapılırken bir hata oluştu');
        }

        if (result.success && result.data) {
            // Token ve kurum bilgilerini sakla
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('kurumId', result.data.kurumId);
            localStorage.setItem('kurumData', JSON.stringify(result.data.institution));
            
            // Panel sayfasına yönlendir
            window.location.href = 'panel.html';
        } else {
            throw new Error(result.message || 'Giriş yapılırken bir hata oluştu');
        }
    } catch (error) {
        console.error('Giriş hatası:', error);
        alert('Giriş yapılırken bir hata oluştu: ' + error.message);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    try {
        // Form verilerini al
        const form = event.target;
        const name = form.querySelector('input[name="name"]').value;
        const type = form.querySelector('select[name="type"]').value;
        const email = form.querySelector('input[name="email"]').value;
        const phone = form.querySelector('input[name="phone"]').value;
        const password = form.querySelector('input[name="password"]').value;
        const passwordConfirm = form.querySelector('input[name="passwordConfirm"]').value;

        console.log('Kayıt bilgileri:', { name, type, email, phone }); // Debug için

        // Validasyonlar
        if (password !== passwordConfirm) {
            alert("Şifreler eşleşmiyor!");
            return;
        }

        if (password.length < 6) {
            alert("Şifre en az 6 karakter olmalıdır!");
            return;
        }

        // Telefon formatı kontrolü
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            alert("Telefon numarası 10 haneli olmalıdır!");
            return;
        }

        // API'ye gönderilecek veri
        const data = {
            name,
            email,
            password,
            phone,
            type,
            address: {
                street: "",
                district: "",
                city: "",
                state: "",
                postalCode: "",
                country: "Türkiye"
            },
            openingHours: "",
            profileImageUrl: "",
            services: [],
            authorizedPersonId: null
        };

        const response = await fetch('http://localhost:3000/api/institution/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Kayıt sırasında bir hata oluştu!");
        }

        alert("Kayıt başarılı! Giriş yapabilirsiniz.");
        
        // Formu temizle
        form.reset();
        
        // Giriş formuna odaklan
        document.querySelector('.login-box input[name="email"]').focus();
        
    } catch (error) {
        console.error('Kayıt hatası:', error);
        alert("Kayıt sırasında bir hata oluştu: " + error.message);
    }
} 
