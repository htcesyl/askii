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
  

  