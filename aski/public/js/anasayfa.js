// Oturum kontrolü
document.addEventListener('DOMContentLoaded', function() {
    // Oturum kontrolü
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const donorData = JSON.parse(localStorage.getItem('donorData'));

    if (!isLoggedIn || !donorData) {
        window.location.href = 'bagiscigiris.html';
        return;
    }
});

// İl seçimine göre ilçeleri güncelle
function populateDistricts() {
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const selectedCity = citySelect.value;

    // İlçe seçimini temizle
    districtSelect.innerHTML = '<option value="">İlçe Seçin</option>';

    // Şehirlere göre ilçeler
    const districts = {
        konya: ['Selçuklu', 'Meram', 'Karatay'],
        ankara: ['Çankaya', 'Keçiören', 'Mamak', 'Yenimahalle'],
        istanbul: ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Şişli']
    };

    // Seçilen şehrin ilçelerini ekle
    if (selectedCity && districts[selectedCity]) {
        districts[selectedCity].forEach(district => {
            const option = document.createElement('option');
            option.value = district.toLowerCase();
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    }
}

// Keşfetmeye başla butonuna tıklandığında
function showRestaurants() {
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const selectedCity = citySelect.value;
    const selectedDistrict = districtSelect.value;

    if (!selectedCity || !selectedDistrict) {
        alert('Lütfen il ve ilçe seçiniz!');
        return;
    }

    console.log('Yönlendirme başlıyor...'); // Debug için
    console.log('Seçilen il:', selectedCity);
    console.log('Seçilen ilçe:', selectedDistrict);

    try {
        // İl ve ilçe isimlerini düzgün formatta kaydet
        localStorage.setItem('selectedCity', selectedCity.trim());
        localStorage.setItem('selectedDistrict', selectedDistrict.trim());

        // Restoranlar sayfasına yönlendir
        window.location.replace('restaurants.html');
    } catch (error) {
        console.error('Yönlendirme hatası:', error);
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Butonu seç
    const donateBtn = document.querySelector('.donate-btn');
    if (donateBtn) {
        // Click event listener ekle
        donateBtn.addEventListener('click', showRestaurants);
    }

    // İl seçimi varsa ilçeleri yükle
    const citySelect = document.getElementById('city');
    if (citySelect) {
        populateDistricts();
    }
}); 