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
    const dropdown = document.querySelector('.profile-dropdown');
    const overlay = document.getElementById('overlay');

    // Dropdown ve overlay gizleme
    dropdown.classList.remove('active');
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



