// Profil dropdown açma kapama işlemleri
document.querySelector('.profile-btn').addEventListener('click', function() {
    const dropdown = document.querySelector('.profile-dropdown');
    const overlay = document.getElementById('overlay');

    // Dropdown görünümünü aç/kapa
    dropdown.classList.toggle('active');

    // Overlay göster/gizle
    if (dropdown.classList.contains('active')) {
        overlay.style.display = 'block';
    } else {
        overlay.style.display = 'none';
    }
});

// Overlay tıklanınca dropdown kapatma
document.getElementById('overlay').addEventListener('click', function() {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'none';
});




document.querySelectorAll('.faq-box').forEach(box => {
    box.addEventListener('click', () => {
        // Aktif sınıfını ekleyip çıkar
        box.classList.toggle('active');
        
        // İçeriği göster/gizle
        const content = box.querySelector('.faq-content');
        if (content.style.display === 'block') {
            content.style.display = 'none';
        } else {
            content.style.display = 'block';
        }
    });
});


/*  il ve ilçe dropdown*/

function populateDistricts() {
    const cityElement = document.getElementById("city");
    const districtElement = document.getElementById("district");
    
    // İlçeleri temizle
    districtElement.innerHTML = '<option value="">İlçe Seçin</option>';
  
    const selectedCity = cityElement.value;
  
    // İl ve ilçeleri tanımla
    const districts = {
      ankara: ["Çankaya", "Keçiören", "Mamak", "Sincan"],
      istanbul: ["Beşiktaş", "Kadıköy", "Üsküdar", "Bakırköy"],
      konya: ["Selçuklu", "Meram", "Karatay", "Akşehir"]
    };
  
    // Seçili ile göre ilçeleri ekle
    if (districts[selectedCity]) {
      districts[selectedCity].forEach(district => {
        const option = document.createElement("option");
        option.value = district.toLowerCase();
        option.textContent = district;
        districtElement.appendChild(option);
      });
    }
  }
  
/* keşfetmeye başla butonu için fonksiyon*/ 

function showRestaurants() {
    const city = document.getElementById("city").value;
    const district = document.getElementById("district").value;

    if (city && district) {
        // Yeni sayfaya yönlendirme, il ve ilçe değerlerini URL parametresi olarak ekler
        window.location.href = `restaurants.html?city=${city}&district=${district}`;
    } else {
        alert("Lütfen il ve ilçe seçin.");
    }
}




// Kayıt formu işlemleri
document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        document.getElementById('register-message').textContent = 'Şifreler uyuşmuyor!';
        return;
    }

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, confirmPassword }),
        });
        const data = await response.text();
        document.getElementById('register-message').textContent = data;
    } catch (err) {
        document.getElementById('register-message').textContent = 'Kayıt işlemi sırasında bir hata oluştu.';
    }
});

// Giriş formu işlemleri
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.text();

        if (response.ok) {
            document.getElementById('login-message').textContent = 'Giriş başarılı! Anasayfaya yönlendiriliyorsunuz...';
            // Yönlendirme yapılabilir
            setTimeout(() => window.location.href = 'anasayfa.html', 2000);
        } else {
            document.getElementById('login-message').textContent = data;
        }
    } catch (err) {
        document.getElementById('login-message').textContent = 'Giriş başarısız! Lütfen e-posta veya şifrenizi kontrol edin.';
    }
});


/* kurum paneli için*/ 


// Bildirim ve Profil butonlarına tıklanma işlemleri için örnek kod
document.querySelector('.notification').addEventListener('click', () => {
    alert('Bildirimleriniz yok!');
});

document.querySelector('.profile').addEventListener('click', () => {
    alert('Profil sayfanıza yönlendiriliyorsunuz!');
});


// restoran dinamik yemek bağışı

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const city = urlParams.get("city") || "Şehir";
    const district = urlParams.get("district") || "İlçe";
    document.getElementById("city-title").innerText = `${city} ${district} Yemek Bağışı`;
});
