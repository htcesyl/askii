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
