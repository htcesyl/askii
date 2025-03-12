// Oturum kontrolü
function checkSession() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const donorData = JSON.parse(localStorage.getItem('donorData'));
    const topbarRight = document.querySelector('.right');
    const logoLink = document.querySelector('.logo-container a');

    if (isLoggedIn && donorData) {
        // Kullanıcı giriş yapmışsa
        if (logoLink) {
            logoLink.href = 'anasayfa.html';
        }

        topbarRight.innerHTML = `
            <div class="profile-section">
                <div class="profile-dropdown">
                    <a href="javascript:void(0);" class="profile-btn" id="profileBtn">
                        Profilim <i class="fa fa-user-circle"></i>
                    </a>
                    <div class="dropdown-content">
                        <div class="user-info">
                            <span>${donorData.name} ${donorData.surname}</span>
                            <span>${donorData.email}</span>
                        </div>
                        <a href="previous-donations.html"><i class="fa fa-history"></i> Önceki Bağışlarım</a>
                        <a href="settings.html"><i class="fa fa-cog"></i> Ayarlar</a>
                        <a href="#" onclick="handleLogout()"><i class="fa fa-sign-out-alt"></i> Çıkış Yap</a>
                    </div>
                </div>
                <a href="javascript:void(0);" onclick="goToPayment()" class="cart-btn">
                    <i class="fas fa-shopping-cart"></i>
                    Sepetim
                    <span class="cart-count" id="cartCount">0</span>
                </a>
            </div>
        `;

        // Sepet sayısını güncelle
        updateCartCount();
    } else {
        // Kullanıcı giriş yapmamışsa
        if (logoLink) {
            logoLink.href = 'index.html';
        }

        topbarRight.innerHTML = `
            <div class="auth-buttons">
                <a href="bagiscigiris.html" class="auth-btn bagisci-btn">Bağışçı Girişi</a>
                <a href="isletmegiris.html" class="auth-btn isletme-btn">İşletme Girişi</a>
            </div>
        `;
    }
}

// Çıkış yapma fonksiyonu - Global scope'ta tanımlandı
window.handleLogout = function() {
    // Tüm oturum verilerini temizle
    localStorage.removeItem('donorData');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('selectedCity');
    localStorage.removeItem('selectedDistrict');
    localStorage.removeItem('cart');
    
    // Ana sayfaya yönlendir
    window.location.href = '/aski/views/index.html';
}

// Giriş sayfaları için oturum kontrolü
function checkLoginPages() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname;
    
    if (isLoggedIn && (
        currentPage.includes('bagiscigiris.html') || 
        currentPage.includes('isletmegiris.html')
    )) {
        window.location.href = 'anasayfa.html';
    }
}

// Sayfa yüklendiğinde kontrolleri yap
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    checkLoginPages();
});

// Hamburger menü için toggleMenu fonksiyonu
function toggleMenu() {
    const menuLinks = document.getElementById('menuLinks');
    menuLinks.classList.toggle('active');
}

// Sayfa yüklendiğinde scroll pozisyonunu kontrol et
window.addEventListener('scroll', function() {
    const topbar = document.querySelector('.topbar');
    if (window.scrollY > 50) {
        topbar.classList.add('scrolled');
    } else {
        topbar.classList.remove('scrolled');
    }
});

// Bağış yap butonu için yönlendirme
document.addEventListener('DOMContentLoaded', function() {
    const donateBtn = document.querySelector('.donate-btn');
    if (donateBtn) {
        donateBtn.addEventListener('click', function() {
            window.location.href = 'bagiscigiris.html';
        });
    }
});

// Sepet sayısını güncelle
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Ödeme sayfasına yönlendirme fonksiyonu
function goToPayment() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Sepetiniz boş!');
        return;
    }
    window.location.href = 'payment.html';
}

// Sayfa yüklendiğinde ve sepet güncellendiğinde sayıyı güncelle
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    updateCartCount();
});

// Sepet değişikliklerini dinle
window.addEventListener('storage', function(e) {
    if (e.key === 'cart') {
        updateCartCount();
    }
}); 