// Global değişkenler
let currentKurumData = JSON.parse(localStorage.getItem('kurumData')) || null;

// Kurum bilgilerini yükle
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('token');
        const kurumId = localStorage.getItem('kurumId');

        if (!token || !kurumId) {
            window.location.href = 'isletmegiris.html';
            return;
        }

        // Önce localStorage'daki verileri göster
        if (currentKurumData) {
            fillProfileForm(currentKurumData);
            updateProfileView(currentKurumData);
        }

        // Ardından güncel verileri getir
        await getProfileData();
        
        // Ürünleri, bağışları ve rezervasyonları yükle
        await Promise.all([
            loadProducts(),
            loadDonations(),
            loadReservations()
        ]);
    } catch (error) {
        console.error('Kurum bilgileri yüklenirken hata:', error);
        // Kritik hata değilse alert gösterme
        if (!currentKurumData) {
            alert('Kurum bilgileri yüklenirken bir hata oluştu: ' + error.message);
        }
    }
});

// Modal kontrolleri
const addProductBtn = document.getElementById('add-product-btn');
const productModal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('close-modal');
const productForm = document.getElementById('product-form');
const productList = document.getElementById('menu-listesi');

const serviceModal = document.getElementById('service-modal');
const addServiceBtn = document.getElementById('add-service-btn');
const closeServiceModalBtn = document.getElementById('close-service-modal');
const serviceForm = document.getElementById('service-form');

// Modal açma/kapama
addProductBtn.addEventListener('click', () => {
    productModal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
    productModal.style.display = 'none';
    productForm.reset();
});

addServiceBtn.addEventListener('click', () => {
    serviceModal.style.display = 'flex';
});

closeServiceModalBtn.addEventListener('click', () => {
    serviceModal.style.display = 'none';
    serviceForm.reset();
});

// Ürün arama ve filtreleme
const searchInput = document.getElementById('urun-ara');
const sortSelect = document.getElementById('urun-sirala');

searchInput.addEventListener('input', filterProducts);
sortSelect.addEventListener('change', filterProducts);

function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortValue = sortSelect.value;
    const products = Array.from(productList.getElementsByClassName('menu-karti'));
    
    products.forEach(product => {
        const name = product.querySelector('h4').textContent.toLowerCase();
        const isVisible = name.includes(searchTerm);
        product.style.display = isVisible ? 'block' : 'none';
    });
    
    // Sıralama
    const sortedProducts = products.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('p:last-child').textContent.replace('Fiyat: ', '').replace(' TL', ''));
        const priceB = parseFloat(b.querySelector('p:last-child').textContent.replace('Fiyat: ', '').replace(' TL', ''));
        
        switch(sortValue) {
            case 'fiyat-artan':
                return priceA - priceB;
            case 'fiyat-azalan':
                return priceB - priceA;
            default:
                return 0;
        }
    });
    
    productList.innerHTML = '';
    sortedProducts.forEach(product => productList.appendChild(product));
}

// Ürün ekleme
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const token = localStorage.getItem('token');
        const kurumId = localStorage.getItem('kurumId');
        
        if (!token || !kurumId) {
            throw new Error('Oturum bilgisi bulunamadı');
        }

        // Form verilerini al
        const formData = new FormData(productForm);
        
        // Ürün verilerini hazırla
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            category: 'genel',
            institutionId: kurumId
        };

        console.log('Gönderilecek ürün veriler:', productData);

        // Görsel dosyasını kontrol et
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            const imageFormData = new FormData();
            imageFormData.append('image', imageFile);

            // Görseli yükle
            const imageResponse = await fetch('http://localhost:3000/api/upload/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: imageFormData
            });

            if (!imageResponse.ok) {
                throw new Error('Görsel yüklenirken hata oluştu');
            }

            const imageResult = await imageResponse.json();
            if (imageResult.success && imageResult.url) {
                productData.profileImageUrl = imageResult.url;
            }
        }
        
        // Ürünü API'ye gönder
        const response = await fetch('http://localhost:3000/api/products/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        console.log('API Yanıtı:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ürün eklenirken bir hata oluştu');
        }
        
        const result = await response.json();
        console.log('API Yanıt İçeriği:', result);
        
        if (result.success) {
            // Modalı kapat ve formu temizle
            productModal.style.display = 'none';
            productForm.reset();
            document.getElementById('image-preview').innerHTML = '';
            
            // Ürünleri yeniden yükle
            await loadProducts();
            
            // Başarı mesajı göster
            alert('Ürün başarıyla eklendi!');
        } else {
            throw new Error(result.message || 'Ürün eklenirken bir hata oluştu');
        }
    } catch (error) {
        console.error('Ürün ekleme hatası:', error);
        alert('Ürün eklenirken bir hata oluştu: ' + error.message);
    }
});

// Görsel önizleme
document.getElementById('product-image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('image-preview');
    
    if (file) {
        // Dosya boyutunu kontrol et (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Dosya boyutu 5MB\'dan büyük olamaz');
            this.value = ''; // Input'u temizle
            preview.innerHTML = '';
            return;
        }

        // Dosya tipini kontrol et
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Sadece JPEG, PNG ve GIF formatları desteklenmektedir');
            this.value = ''; // Input'u temizle
            preview.innerHTML = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Önizleme" style="max-width: 200px; max-height: 200px;">
            `;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
});

// Ürün kartını oluştur veya güncelle
function renderProductCard(product, addToTop = false) {
    console.log('Ürün kartı oluşturuluyor/güncelleniyor:', product);

    // Önce mevcut kartı kontrol et
    let existingCard = document.querySelector(`[data-product-id="${product._id}"]`);
    const menuListesi = document.getElementById('menu-listesi');

    // Kart HTML'ini oluştur
    const cardHTML = `
        <div class="product-image">
            ${product.profileImageUrl ? `<img src="http://localhost:3000${product.profileImageUrl}" alt="${product.name}" onerror="this.style.display='none'">` : ''}
        </div>
        <div class="menu-karti-icerik">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Fiyat: ${product.price} TL</p>
            <p>Stok: ${product.stock}</p>
            <div class="product-actions">
                <button onclick="editProduct('${product._id}')" class="edit-btn">Düzenle</button>
                <button onclick="deleteProduct('${product._id}')" class="delete-btn">Sil</button>
                <button onclick="askiyaBirak('${product._id}')" class="askiya-birak-btn">Askıya Bırak</button>
            </div>
        </div>
    `;

    if (existingCard) {
        existingCard.innerHTML = cardHTML;
        if (addToTop && menuListesi.firstChild !== existingCard) {
            menuListesi.insertBefore(existingCard, menuListesi.firstChild);
        }
    } else {
        const card = document.createElement('div');
        card.className = 'menu-karti';
        card.setAttribute('data-product-id', product._id);
        card.innerHTML = cardHTML;

        if (addToTop && menuListesi.firstChild) {
            menuListesi.insertBefore(card, menuListesi.firstChild);
        } else {
            menuListesi.appendChild(card);
        }
    }
}

// Ürün düzenleme
async function editProduct(productId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Oturum bilgisi bulunamadı');
        }

        console.log('Ürün düzenleme başlatılıyor:', productId);

        // Ürün bilgilerini getir
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ürün bilgileri alınamadı');
        }

        const result = await response.json();
        const product = result.data;

        // Form alanlarını doldur
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-stock').value = product.stock || '';

        // Mevcut görseli önizlemede göster
        const preview = document.getElementById('image-preview');
        preview.innerHTML = '';
        if (product.profileImageUrl) {
            preview.innerHTML = `
                <img src="http://localhost:3000${product.profileImageUrl}" alt="Mevcut görsel" style="max-width: 200px; max-height: 200px;">
            `;
        }

        // Modal başlığını ve buton metnini güncelle
        document.querySelector('.modal-header h3').textContent = 'Ürün Düzenle';
        document.querySelector('.submit-btn').textContent = 'Güncelle';

        // Form submit işleyicisini güncelle
        const productForm = document.getElementById('product-form');
        
        // Önceki event listener'ları kaldır
        const newForm = productForm.cloneNode(true);
        productForm.parentNode.replaceChild(newForm, productForm);
        
        // Yeni event listener ekle
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                console.log('Ürün güncelleme başlatılıyor:', productId);

                // Form verilerini al
                const formData = new FormData(newForm);

                // Ürün verilerini hazırla
                const productData = {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    price: parseFloat(formData.get('price')),
                    stock: parseInt(formData.get('stock')),
                    category: 'genel'
                };

                // Görsel dosyasını kontrol et
                const imageFile = formData.get('image');
                if (imageFile && imageFile.size > 0) {
                    const imageFormData = new FormData();
                    imageFormData.append('image', imageFile);

                    console.log('Görsel yükleniyor...');

                    try {
                        // Görseli yükle
                        const imageResponse = await fetch('http://localhost:3000/api/upload/image', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            body: imageFormData
                        });

                        if (!imageResponse.ok) {
                            throw new Error('Görsel yüklenirken hata oluştu');
                        }

                        const imageResult = await imageResponse.json();
                        if (imageResult.success && imageResult.url) {
                            productData.profileImageUrl = imageResult.url;
                        }
                    } catch (imageError) {
                        console.error('Görsel yükleme hatası:', imageError);
                        // Görsel yükleme hatası durumunda mevcut görseli koru
                        if (product.profileImageUrl) {
                            productData.profileImageUrl = product.profileImageUrl;
                        }
                    }
                } else if (product.profileImageUrl) {
                    // Eğer yeni görsel yüklenmediyse mevcut görseli koru
                    productData.profileImageUrl = product.profileImageUrl;
                }

                console.log('Gönderilecek güncelleme verileri:', productData);

                try {
                    // Ürün bilgilerini güncelle
                    const updateResponse = await fetch(`http://localhost:3000/api/products/${productId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(productData)
                    });

                    const updateResult = await updateResponse.json();

                    if (updateResult.success) {
                        // Modalı kapat
                        const productModal = document.getElementById('product-modal');
                        productModal.style.display = 'none';

                        // Formu temizle
                        newForm.reset();
                        document.getElementById('image-preview').innerHTML = '';

                        // Ürünleri yeniden yükle
                        await loadProducts();

                        // Başarı mesajı göster
                        alert('Ürün başarıyla güncellendi!');
                    } else {
                        throw new Error(updateResult.message || 'Ürün güncellenirken bir hata oluştu');
                    }
                } catch (updateError) {
                    console.error('Güncelleme hatası:', updateError);
                    // Eğer güncelleme başarılı olduysa hata gösterme
                    if (updateError.message === 'Failed to fetch' && await checkProductUpdated(productId, productData)) {
                        // Modalı kapat
                        const productModal = document.getElementById('product-modal');
                        productModal.style.display = 'none';

                        // Formu temizle
                        newForm.reset();
                        document.getElementById('image-preview').innerHTML = '';

                        // Ürünleri yeniden yükle
                        await loadProducts();

                        // Başarı mesajı göster
                        alert('Ürün başarıyla güncellendi!');
                    } else {
                        throw updateError;
                    }
                }
            } catch (error) {
                console.error('Ürün güncelleme hatası:', error);
                if (error.message !== 'Failed to fetch') {
                    alert('Ürün güncellenirken bir hata oluştu: ' + error.message);
                }
            }
        });

        // Modalı aç
        const productModal = document.getElementById('product-modal');
        productModal.style.display = 'flex';

    } catch (error) {
        console.error('Ürün bilgileri alınırken hata:', error);
        alert('Ürün bilgileri alınırken bir hata oluştu: ' + error.message);
    }
}

// Ürünün güncellenip güncellenmediğini kontrol et
async function checkProductUpdated(productId, updatedData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return false;
        }

        const result = await response.json();
        const product = result.data;

        // Temel alanları karşılaştır
        return product.name === updatedData.name &&
               product.description === updatedData.description &&
               product.price === updatedData.price &&
               product.stock === updatedData.stock;
    } catch (error) {
        console.error('Ürün kontrol hatası:', error);
        return false;
    }
}

// Ürün silme
async function deleteProduct(productId) {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Oturum bilgisi bulunamadı');
            }

            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ürün silinirken bir hata oluştu');
            }

            const result = await response.json();
            
            if (result.success) {
                // Ürün kartını DOM'dan kaldır
                const productCard = document.querySelector(`[data-product-id="${productId}"]`);
                if (productCard) {
                    productCard.remove();
                }
                alert('Ürün başarıyla silindi!');
            } else {
                throw new Error(result.message || 'Ürün silinirken bir hata oluştu');
            }
        } catch (error) {
            console.error('Ürün silme hatası:', error);
            alert('Ürün silinirken bir hata oluştu: ' + error.message);
        }
    }
}

// Hizmet ekleme
serviceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(serviceForm);
    
    try {
        const response = await fetch('/api/hizmetler', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                serviceType: formData.get('serviceType'),
                description: formData.get('description')
            })
        });
        
        if (response.ok) {
            const newService = await response.json();
            renderServiceCard(newService);
            serviceModal.style.display = 'none';
            serviceForm.reset();
        } else {
            throw new Error('Hizmet eklenirken bir hata oluştu');
        }
    } catch (error) {
        console.error('Hizmet ekleme hatası:', error);
        alert('Hizmet eklenirken bir hata oluştu.');
    }
});

// Hizmet kartı oluşturma
function renderServiceCard(service) {
    const serviceCard = document.createElement('div');
    serviceCard.classList.add('hizmet-karti');
    serviceCard.innerHTML = `
        <h4>${service.serviceType}</h4>
        <p>${service.description}</p>
        <div class="card-actions">
            <button onclick="editService('${service._id}')" class="edit-btn">Düzenle</button>
            <button onclick="deleteService('${service._id}')" class="delete-btn">Sil</button>
        </div>
    `;
    document.querySelector('.hizmet-listesi').appendChild(serviceCard);
}

// Ürünleri yükle
async function loadProducts() {
    try {
        const token = localStorage.getItem('token');
        const kurumId = localStorage.getItem('kurumId');
        
        if (!token || !kurumId) {
            throw new Error('Oturum bilgisi bulunamadı');
        }

        console.log('Ürünler yükleniyor...', { kurumId, token: token.substring(0, 10) + '...' });
        
        const response = await fetch(`http://localhost:3000/api/products/institution/${kurumId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('API Yanıtı:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error('Ürünler alınırken bir hata oluştu');
        }
        
        const result = await response.json();
        console.log('Yüklenen ürünler:', result);
        
        // Ürün listesini temizle
        const productList = document.getElementById('menu-listesi');
        productList.innerHTML = '';
        
        if (result.success && result.data) {
            // Her ürün için kart oluştur
            result.data.forEach(product => {
                const card = document.createElement('div');
                card.className = 'menu-karti';
                card.setAttribute('data-product-id', product._id);
                card.innerHTML = `
                    <div class="product-image">
                        ${product.profileImageUrl ? `<img src="http://localhost:3000${product.profileImageUrl}" alt="${product.name}" onerror="this.style.display='none'">` : ''}
                    </div>
                    <div class="menu-karti-icerik">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p>Fiyat: ${product.price} TL</p>
                        <p>Stok: ${product.stock}</p>
                        <div class="product-actions">
                            <button onclick="editProduct('${product._id}')" class="edit-btn">Düzenle</button>
                            <button onclick="deleteProduct('${product._id}')" class="delete-btn">Sil</button>
                            <button onclick="askiyaBirak('${product._id}')" class="askiya-birak-btn">Askıya Bırak</button>
                        </div>
                    </div>
                `;
                productList.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
        alert('Ürünler yüklenirken bir hata oluştu: ' + error.message);
    }
}

// Bağışları yükle
async function loadDonations() {
    try {
        const token = localStorage.getItem('token');
        const kurumId = localStorage.getItem('kurumId');

        if (!token || !kurumId) {
            throw new Error('Oturum bilgisi bulunamadı');
        }

        console.log('Bağışlar yükleniyor...', {
            kurumId,
            token: token.substring(0, 10) + '...'
        });

            // Tüm bağışları getir
        const response = await fetch(`http://localhost:3000/api/donations/list?institutionId=${kurumId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
        });

        console.log('Bağışlar API yanıtı:', {
            status: response.status,
            statusText: response.statusText
        });

        if (!response.ok) {
            throw new Error('Bağışlar alınamadı');
        }

        const result = await response.json();
        console.log('Yüklenen bağışlar:', result);

        if (result.success && result.data) {
            // Tüm bağışları global değişkene kaydet
            window.currentDonations = result.data;
            
            // Bağışları görüntüle
            displayDonations(result.data);

            // Tab butonlarını aktifleştir
            const tabButtons = document.querySelectorAll('.tab-btn');
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Aktif tab'ı değiştir
                    document.querySelector('.tab-btn.active')?.classList.remove('active');
                    button.classList.add('active');
                    
                    // İlgili içeriği göster
                    const tabId = button.dataset.tab;
                    document.querySelector('.bagis-tab-content.active')?.classList.remove('active');
                    document.getElementById(`${tabId}-bagislar`).classList.add('active');
                });
            });

            // Varsayılan olarak bekleyen bağışlar sekmesini göster
            const bekleyenTab = document.querySelector('[data-tab="bekleyen"]');
            if (bekleyenTab) {
                bekleyenTab.click();
            }
            } else {
            throw new Error(result.message || 'Bağışlar alınamadı');
        }
    } catch (error) {
        console.error('Bağışlar yüklenirken hata:', error);
            Swal.fire({
                title: 'Hata!',
                text: 'Bağışlar yüklenirken bir hata oluştu: ' + error.message,
                icon: 'error'
            });
    }
}

// Bağış istatistiklerini güncelle
function updateDonationStats(donations) {
    const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
    const pendingDonations = donations.filter(d => d.status === 'beklemede').length;
    const approvedDonations = donations.filter(d => d.status === 'onaylandı').length;
    const canceledDonations = donations.filter(d => d.status === 'iptal edildi' || d.status === 'iptal_edildi').length;

    document.getElementById('toplam-bagis').textContent = `${totalAmount.toFixed(2)} TL`;
    document.getElementById('bagis-sayisi').textContent = donations.length;
    document.getElementById('bekleyen-bagis').textContent = pendingDonations;
}

// Bağışları görüntüle
function displayDonations(donations) {
    console.log('Gelen tüm bağışlar:', donations);

    // Bağışları durumlarına göre ayır
    const bekleyenBagislar = donations.filter(d => d.status === 'beklemede');
    const onaylananBagislar = donations.filter(d => d.status === 'onaylandı');
    const iptalBagislar = donations.filter(d => d.status === 'iptal edildi' || d.status === 'iptal_edildi');

    console.log('Bağışlar durumlarına göre ayrıldı:', {
        bekleyen: bekleyenBagislar.length,
        onaylanan: onaylananBagislar.length,
        iptal: iptalBagislar.length,
        durumlar: donations.map(d => d.status)
    });

    // Bekleyen bağışları göster
    document.getElementById('bekleyen-bagislar-body').innerHTML = bekleyenBagislar.map(donation => {
        // Bağışçı bilgilerini kontrol et
        const donorName = donation.donorId ? `${donation.donorId.name} ${donation.donorId.surname}` : 'Bilinmeyen Bağışçı';
        
        // Ürün detaylarını kontrol et ve güvenli bir şekilde göster
        const productDetails = donation.productsDonated.map(product => {
            const productName = product.productId ? product.productId.name : 'Ürün bilgisi bulunamadı';
            return `${productName} (${product.quantity} adet)`;
        }).join(', ');

        return `
            <tr>
                <td class="durum-hucre">
                    <div class="durum-container">
                        <i class="fas fa-clock bekleyen-icon" title="Beklemede"></i>
                    </div>
                </td>
                <td>${new Date(donation.createdAt).toLocaleString('tr-TR')}</td>
                <td>${donorName}</td>
                <td>${productDetails}</td>
                <td>${donation.amount.toFixed(2)} TL</td>
                <td>
                    <span class="bagis-durum beklemede">Beklemede</span>
                </td>
                <td>
                    <button onclick="showDonationDetails('${donation._id}')" class="detay-btn">
                        Detay
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Onaylanan bağışları göster
    document.getElementById('onaylanan-bagislar-body').innerHTML = onaylananBagislar.map(donation => {
        // Bağışçı bilgilerini kontrol et
        const donorName = donation.donorId ? `${donation.donorId.name} ${donation.donorId.surname}` : 'Bilinmeyen Bağışçı';
        
        // Ürün detaylarını kontrol et ve güvenli bir şekilde göster
        const productDetails = donation.productsDonated.map(product => {
            const productName = product.productId ? product.productId.name : 'Ürün bilgisi bulunamadı';
            return `${productName} (${product.quantity} adet)`;
        }).join(', ');

        return `
            <tr>
                <td>${new Date(donation.createdAt).toLocaleString('tr-TR')}</td>
                <td>${donorName}</td>
                <td>${productDetails}</td>
                <td>${donation.amount.toFixed(2)} TL</td>
                <td>${new Date(donation.updatedAt).toLocaleString('tr-TR')}</td>
                <td>
                    <button onclick="showDonationDetails('${donation._id}')" class="detay-btn">
                        Detay
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // İptal edilen bağışları göster
    document.getElementById('iptal-bagislar-body').innerHTML = iptalBagislar.map(donation => {
        // Bağışçı bilgilerini kontrol et
        const donorName = donation.donorId ? `${donation.donorId.name} ${donation.donorId.surname}` : 'Bilinmeyen Bağışçı';
        
        // Ürün detaylarını kontrol et ve güvenli bir şekilde göster
        const productDetails = donation.productsDonated.map(product => {
            const productName = product.productId ? product.productId.name : 'Ürün bilgisi bulunamadı';
            return `${productName} (${product.quantity} adet)`;
        }).join(', ');

        return `
            <tr>
                <td>${new Date(donation.createdAt).toLocaleString('tr-TR')}</td>
                <td>${donorName}</td>
                <td>${productDetails}</td>
                <td>${donation.amount.toFixed(2)} TL</td>
                <td>${new Date(donation.updatedAt).toLocaleString('tr-TR')}</td>
                <td>
                    <button onclick="showDonationDetails('${donation._id}')" class="detay-btn">
                        Detay
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // İstatistikleri güncelle
    updateDonationStats(donations);
}

function showDonationDetails(donationId) {
    console.log('Detay modalı açılıyor, ID:', donationId);

    const donation = window.currentDonations.find(d => d._id === donationId);
    if (!donation) {
        console.error('Bağış bulunamadı');
        return;
    }

    // Modal içeriğini doldur
    const bagisciAdSoyadElement = document.getElementById('bagisci-adsoyad');
    const bagisciEmailElement = document.getElementById('bagisci-email');

    if (donation.donorType === 'institution') {
        // Kurum bağışı ise
        const kurum = donation.institutionId || {};
        bagisciAdSoyadElement.textContent = kurum.name || 'Bilinmeyen Kurum';
        bagisciEmailElement.textContent = kurum.email || 'E-posta bilgisi yok';
    } else {
        // Normal bağış ise
        const bagisci = donation.donorId || {};
        const adSoyad = bagisci.name || bagisci.surname ? 
            `${bagisci.name || ''} ${bagisci.surname || ''}`.trim() : 
            'Bilinmeyen Bağışçı';
        bagisciAdSoyadElement.textContent = adSoyad;
        bagisciEmailElement.textContent = bagisci.email || 'E-posta bilgisi yok';
    }

    // Bağış detayları
    document.getElementById('bagis-toplam').textContent = donation.amount ? 
        `${donation.amount.toFixed(2)} TL` : 
        'Tutar bilgisi yok';
    
    document.getElementById('bagis-tarihi').textContent = donation.createdAt ? 
        new Date(donation.createdAt).toLocaleString('tr-TR') : 
        'Tarih bilgisi yok';
    
    document.getElementById('bagis-durumu').textContent = donation.status || 'Durum bilgisi yok';

    // Ürünleri listele
    const urunlerTbody = document.getElementById('bagis-urunleri-body');
    urunlerTbody.innerHTML = (donation.productsDonated || []).map(product => {
        const urun = product.productId || {};
        const miktar = product.quantity || 0;
        const birimFiyat = urun.price || product.price || 0;
        const toplamFiyat = miktar * birimFiyat;
        
        return `
            <tr>
                <td>${urun.name || 'Bilinmeyen Ürün'}</td>
                <td>${miktar} adet</td>
                <td>${birimFiyat.toFixed(2)} TL</td>
                <td>${toplamFiyat.toFixed(2)} TL</td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="4">Ürün bilgisi bulunamadı</td></tr>';
    
    // Durum butonlarını ayarla
    const onaylaBtn = document.getElementById('bagis-onayla');
    const iptalBtn = document.getElementById('bagis-iptal');
    
    if (donation.status === 'beklemede') {
        onaylaBtn.style.display = 'block';
        iptalBtn.style.display = 'block';
        
        // Onaylama butonu click event'i
        onaylaBtn.onclick = async () => {
            try {
                // Onaylama işlemi öncesi onay al
                const result = await Swal.fire({
                    title: 'Bağış Onayı',
                    text: 'Bu bağışı onaylamak istediğinize emin misiniz?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Evet, Onayla',
                    cancelButtonText: 'Vazgeç',
                    confirmButtonColor: '#4CAF50',
                    cancelButtonColor: '#6c757d'
                });

                if (result.isConfirmed) {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        throw new Error('Oturum bilgisi bulunamadı');
                    }

                    // Bağışı onayla
                    const response = await fetch('http://localhost:3000/api/donations/update-status', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            donationId: donationId,
                            status: 'onaylandı'
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Bağış onaylanırken bir hata oluştu');
                    }

                    const data = await response.json();
                    
                    if (!response.ok || !data.success) {
                        throw new Error(data.message || 'Bağış onaylanırken bir hata oluştu');
                    }

                    // Başarılı mesajı göster
                    await Swal.fire({
                        title: 'Başarılı!',
                        text: 'Bağış başarıyla onaylandı.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                
                    // Modal'ı kapat
                    const modal = document.getElementById('bagis-detay-modal');
                    modal.style.display = 'none';

                    // Bağışları yeniden yükle
                    await loadDonations();
                }
            } catch (error) {
                console.error('Onaylama hatası:', error);
                Swal.fire({
                    title: 'Hata!',
                    text: error.message || 'Bağış onaylanırken bir hata oluştu',
                    icon: 'error',
                    confirmButtonText: 'Tamam'
                });
            }
        };

        // İptal butonu click event'i
        iptalBtn.onclick = async () => {
            try {
                // İptal modalı göster
                const result = await Swal.fire({
                    title: 'Bağış İptali',
                    text: 'Bu bağışı iptal etmek istediğinize emin misiniz?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Evet, İptal Et',
                    cancelButtonText: 'Vazgeç',
                    confirmButtonColor: '#f44336',
                    cancelButtonColor: '#6c757d'
                });

                if (result.isConfirmed) {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        throw new Error('Oturum bilgisi bulunamadı');
                    }

                    // API isteği gönder
                    const response = await fetch('http://localhost:3000/api/donations/update-status', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            donationId: donationId,
                            status: 'iptal edildi'
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Bağış iptal edilirken bir hata oluştu');
                    }

                    const data = await response.json();
                    
                    if (!response.ok || !data.success) {
                        throw new Error(data.message || 'Bağış iptal edilirken bir hata oluştu');
                    }

                    // Başarılı mesajı göster
                    await Swal.fire({
                        title: 'İptal Edildi',
                        text: 'Bağış başarıyla iptal edildi.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // Modal'ı kapat
                    const modal = document.getElementById('bagis-detay-modal');
                    modal.style.display = 'none';

                    // Bağışları yeniden yükle
                    await loadDonations();
                }
            } catch (error) {
                console.error('İptal hatası:', error);
                Swal.fire({
                    title: 'Hata!',
                    text: error.message || 'Bağış iptal edilirken bir hata oluştu',
                    icon: 'error',
                    confirmButtonText: 'Tamam'
                });
            }
        };
    } else {
        onaylaBtn.style.display = 'none';
        iptalBtn.style.display = 'none';
    }

    // Modal'ı göster
    const modal = document.getElementById('bagis-detay-modal');
    modal.style.display = 'flex';

    // Modal kapatma butonunu aktifleştir
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // Modal dışına tıklandığında kapatma
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Bağış durumunu güncelle
async function updateDonationStatus(donationId, newStatus) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Oturum bilgisi bulunamadı');
        }

        console.log('Güncellenecek bağış bilgileri:', {
            donationId,
            newStatus,
            token: token.substring(0, 10) + '...'
        });

        // Debug için ID ve status'u logla
        const response = await fetch('http://localhost:3000/api/donations/update-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                donationId: donationId,
                status: newStatus
            })
        });

        console.log('API yanıtı alındı:', { 
            status: response.status,
            statusText: response.statusText
        });

        const result = await response.json();
        console.log('API yanıt içeriği:', result);

        if (!response.ok) {
            throw new Error(result.message || 'Bağış durumu güncellenirken bir hata oluştu');
        }

        if (!result.success) {
            throw new Error(result.message || 'İşlem tamamlanamadı');
        }

        // Global bağış listesini güncelle
        const donationIndex = window.currentDonations.findIndex(d => d._id === donationId);
        if (donationIndex !== -1) {
            window.currentDonations[donationIndex] = {
                ...window.currentDonations[donationIndex],
                status: newStatus,
                updatedAt: new Date().toISOString()
            };
        }

        // Bağışları yeniden yükle ve görüntüle
        await loadDonations();
        
        // Başarı mesajı göster
        await Swal.fire({
            title: 'Başarılı!',
            text: newStatus === 'onaylandı' ? 'Bağış başarıyla onaylandı.' : 'Bağış durumu güncellendi.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        return result;
    } catch (error) {
        console.error('Güncelleme hatası:', error);
        
        // Hata mesajını göster
        await Swal.fire({
            title: 'Hata!',
            text: error.message || 'Bağış durumu güncellenirken bir hata oluştu',
            icon: 'error',
            confirmButtonText: 'Tamam'
        });

        throw error;
    }
}

// Hizmetleri yükle
async function loadServices() {
    try {
        const token = localStorage.getItem('token');
        const kurumId = localStorage.getItem('kurumId');

        const response = await fetch(`http://localhost:3000/api/services/${kurumId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Hizmetler alınırken bir hata oluştu');
        }
        
        const result = await response.json();
        if (result.success && result.data) {
            const servicesList = document.querySelector('.hizmet-listesi');
            servicesList.innerHTML = '';
            result.data.forEach(service => renderServiceCard(service));
        }
    } catch (error) {
        console.error('Hizmetler yüklenirken hata:', error);
    }
}

// Çıkış yapma işlemi
document.getElementById('cikis-yap').addEventListener('click', async () => {
    try {
        // LocalStorage'dan verileri temizle
        localStorage.removeItem('token');
        localStorage.removeItem('kurumData');
        localStorage.removeItem('kurumId');
        
        // Kullanıcıyı giriş sayfasına yönlendir
        window.location.href = '/aski/views/index.html';
    } catch (error) {
        console.error('Çıkış yapma hatası:', error);
        Swal.fire({
            title: 'Hata!',
            text: 'Çıkış yapılırken bir hata oluştu',
            icon: 'error',
            confirmButtonText: 'Tamam'
        });
    }
});

// Hizmet güncelleme
async function updateService(serviceId, formData) {
    try {
        const serviceData = {
            serviceType: formData.get('serviceType'),
            description: formData.get('description')
        };
        
        // Hizmet bilgilerini güncelle
        const response = await fetch(`/api/hizmet/${serviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(serviceData)
        });

        if (response.ok) {
            const updatedService = await response.json();
            
            // Hizmet kartını güncelle
            const serviceCard = document.querySelector(`[data-service-id="${serviceId}"]`);
            if (serviceCard) {
                serviceCard.querySelector('h4').textContent = updatedService.serviceType;
                serviceCard.querySelector('p').textContent = updatedService.description;
            }
            
            // Modalı kapat ve formu temizle
            serviceModal.style.display = 'none';
            serviceForm.reset();
            
            alert('Hizmet başarıyla güncellendi!');
        } else {
            throw new Error('Hizmet güncellenirken bir hata oluştu');
        }
    } catch (error) {
        console.error('Hizmet güncelleme hatası:', error);
        alert('Hizmet güncellenirken bir hata oluştu.');
    }
}

// Hizmet silme
async function deleteService(serviceId) {
    if (confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
        try {
            const response = await fetch(`/api/hizmet/${serviceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                // Hizmet kartını DOM'dan kaldır
                const serviceCard = document.querySelector(`[data-service-id="${serviceId}"]`);
                if (serviceCard) {
                    serviceCard.remove();
                }
                alert('Hizmet başarıyla silindi!');
            } else {
                throw new Error('Hizmet silinirken bir hata oluştu');
            }
        } catch (error) {
            console.error('Hizmet silme hatası:', error);
            alert('Hizmet silinirken bir hata oluştu.');
        }
    }
}

// Bağış durumunu güncelle
async function updateDonationStatus(donationId, newStatus) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Oturum bilgisi bulunamadı');
        }

        console.log('Güncellenecek bağış bilgileri:', {
            donationId,
            newStatus,
            token: token.substring(0, 10) + '...'
        });

        // Debug için ID ve status'u logla
        const response = await fetch('http://localhost:3000/api/donations/update-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                donationId: donationId,
                status: newStatus
            })
        });

        console.log('API yanıtı alındı:', { 
            status: response.status,
            statusText: response.statusText
        });

        const result = await response.json();
        console.log('API yanıt içeriği:', result);

        if (!response.ok) {
            throw new Error(result.message || 'Bağış durumu güncellenirken bir hata oluştu');
        }

        if (!result.success) {
            throw new Error(result.message || 'İşlem tamamlanamadı');
        }

        // Global bağış listesini güncelle
        const donationIndex = window.currentDonations.findIndex(d => d._id === donationId);
        if (donationIndex !== -1) {
            window.currentDonations[donationIndex] = {
                ...window.currentDonations[donationIndex],
                status: newStatus,
                updatedAt: new Date().toISOString()
            };
        }

        // Bağışları yeniden yükle ve görüntüle
        await loadDonations();
        
        // Başarı mesajı göster
        await Swal.fire({
            title: 'Başarılı!',
            text: newStatus === 'onaylandı' ? 'Bağış başarıyla onaylandı.' : 'Bağış durumu güncellendi.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        return result;
    } catch (error) {
        console.error('Güncelleme hatası:', error);
        
        // Hata mesajını göster
        await Swal.fire({
            title: 'Hata!',
            text: error.message || 'Bağış durumu güncellenirken bir hata oluştu',
            icon: 'error',
            confirmButtonText: 'Tamam'
        });

        throw error;
    }
}

// Profil yönetimi kodları
const editProfileBtn = document.getElementById('edit-profile-btn');
const profileForm = document.getElementById('profile-form');
const profileView = document.getElementById('profile-view');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const logoInput = document.getElementById('kurum-logo-input');
const logoPreview = document.getElementById('logo-preview');

// Profil bilgilerini getir
async function getProfileData() {
    try {
        const token = localStorage.getItem('token');
        const kurumId = localStorage.getItem('kurumId');
        
        if (!token || !kurumId) {
            throw new Error('Oturum bilgisi bulunamadı');
        }

        console.log('Token:', token);
        console.log('Kurum ID:', kurumId);

        const response = await fetch(`http://localhost:3000/api/institution/${kurumId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Profil bilgileri alınamadı');
        }

        const result = await response.json();
        console.log('Alınan profil bilgileri:', result);
        
        if (result.success && result.data) {
            localStorage.setItem('kurumData', JSON.stringify(result.data));
            currentKurumData = result.data;
            
            fillProfileForm(result.data);
            updateProfileView(result.data);
            
            return result.data;
        } else {
            throw new Error(result.message || 'Profil bilgileri alınamadı');
        }
        
    } catch (error) {
        console.error('Kurum bilgileri yüklenirken hata:', error);
        if (!localStorage.getItem('kurumData')) {
            alert('Profil bilgileri alınırken bir hata oluştu: ' + error.message);
        }
    }
}

// Form alanlarını mevcut verilerle doldur
function fillProfileForm(data) {
    if (!data) return;
    
    document.getElementById('kurum-adi-input').value = data.name || '';
    document.getElementById('kurum-tipi-input').value = data.type || '';
    document.getElementById('kurum-email-input').value = data.email || '';
    document.getElementById('kurum-telefon-input').value = data.phone || '';
    document.getElementById('calisma-saatleri-input').value = data.openingHours || '';
    
    const adres = data.address || {};
    document.getElementById('address-street').value = adres.street || '';
    document.getElementById('address-district').value = adres.district || '';
    document.getElementById('address-city').value = adres.city || '';
    document.getElementById('address-state').value = adres.state || '';
    document.getElementById('address-postal').value = adres.postalCode || '';
}

// Görüntüleme modunda profil bilgilerini güncelle
function updateProfileView(data) {
    if (!data) return;
    
    document.getElementById('kurum-logo-preview').src = data.profileImageUrl || '';
    document.getElementById('kurum-adi-text').textContent = data.name || '';
    document.getElementById('kurum-tipi-text').textContent = data.type === 'restoran' ? 'Restoran' : 'Mağaza';
    document.getElementById('kurum-email-text').textContent = data.email || '';
    document.getElementById('kurum-telefon-text').textContent = data.phone || '';
    document.getElementById('calisma-saatleri-text').textContent = data.openingHours || 'Belirtilmemiş';
    
    const adres = data.address || {};
    const adresText = adres.street && adres.city ? 
        `${adres.street}, ${adres.district || ''}, ${adres.city}/${adres.state || ''} ${adres.postalCode || ''}` :
        'Adres bilgisi girilmemiş';
    document.getElementById('tam-adres-text').textContent = adresText;
    
    // Üst bar ve sidebar'daki bilgileri de güncelle
    document.getElementById('kurum-adi').textContent = data.name || '';
    document.getElementById('kurum-logo').src = data.profileImageUrl || '';
    document.getElementById('kurum-tipi').textContent = data.type === 'restoran' ? 'Restoran' : 'Mağaza';
}

// Profil düzenleme modunu aç
editProfileBtn.addEventListener('click', () => {
    profileView.style.display = 'none';
    profileForm.style.display = 'grid';
});

// Profil düzenlemeyi iptal et
cancelEditBtn.addEventListener('click', () => {
    profileForm.style.display = 'none';
    profileView.style.display = 'grid';
    fillProfileForm(currentKurumData);
});

// Logo önizleme
logoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '200px';
            img.style.maxHeight = '200px';
            logoPreview.innerHTML = '';
            logoPreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
});

// Profil formunu gönder
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const kurumId = localStorage.getItem('kurumId');
    
    if (!token || !kurumId) {
        alert('Oturum bilgisi bulunamadı! Lütfen tekrar giriş yapın.');
        window.location.href = 'isletmegiris.html';
        return;
    }

    const logoFile = document.getElementById('kurum-logo-input').files[0];
    let profileImageUrl = currentKurumData?.profileImageUrl || null;

    if (logoFile) {
        try {
            profileImageUrl = await uploadImage(logoFile, token);
            console.log('Logo yüklendi:', profileImageUrl);
        } catch (error) {
            console.error('Logo yükleme hatası:', error);
            alert('Logo yüklenirken bir hata oluştu: ' + error.message);
            return;
        }
    }
    
    const kurumData = {
        name: document.getElementById('kurum-adi-input').value.trim(),
        type: document.getElementById('kurum-tipi-input').value.trim(),
        email: document.getElementById('kurum-email-input').value.trim(),
        phone: document.getElementById('kurum-telefon-input').value.trim(),
        openingHours: document.getElementById('calisma-saatleri-input').value.trim(),
        address: {
            street: document.getElementById('address-street').value.trim(),
            district: document.getElementById('address-district').value.trim(),
            city: document.getElementById('address-city').value.trim(),
            state: document.getElementById('address-state').value.trim(),
            postalCode: document.getElementById('address-postal').value.trim()
        },
        profileImageUrl: profileImageUrl
    };

    if (!kurumData.name || !kurumData.email || !kurumData.type) {
        alert('Lütfen zorunlu alanları doldurun (Kurum Adı, E-posta ve Kurum Tipi)');
        return;
    }

    const response = await fetch(`http://localhost:3000/api/institution/${kurumId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(kurumData)
    });

    const responseData = await response.json();
    localStorage.setItem('kurumData', JSON.stringify(responseData.data));
    currentKurumData = responseData.data;
    
    updateProfileView(responseData.data);
    
    profileForm.style.display = 'none';
    profileView.style.display = 'grid';
    
    document.getElementById('kurum-logo-input').value = '';
    document.getElementById('logo-preview').innerHTML = '';
    
    alert('Profil bilgileri başarıyla güncellendi!');
});

// Logo yükleme işlemi
async function uploadImage(imageFile, token) {
    const imageFormData = new FormData();
    imageFormData.append('image', imageFile);

    try {
        const imageResponse = await fetch('http://localhost:3000/api/upload/image', {
            method: 'POST',
            body: imageFormData,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'omit'
        });

        if (!imageResponse.ok) {
            const errorData = await imageResponse.json().catch(() => ({}));
            throw new Error(errorData.message || 'Görsel yüklenirken bir hata oluştu');
        }

        const imageResult = await imageResponse.json();
        if (!imageResult.success) {
            throw new Error(imageResult.message || 'Görsel yüklenirken bir hata oluştu');
        }

        return `http://localhost:3000${imageResult.url}`;
    } catch (error) {
        console.error('Görsel yükleme hatası:', error);
        throw error;
    }
}

// Ürünü askıya bırak
async function askiyaBirak(productId) {
    try {
        const token = localStorage.getItem('token');
        const kurumData = JSON.parse(localStorage.getItem('kurumData'));
        
        if (!token || !kurumData) {
            throw new Error('Oturum bilgisi bulunamadı');
        }

        // Önce ürün bilgilerini al
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ürün bilgileri alınamadı');
        }

        const product = await response.json();
        console.log('Ürün bilgileri:', product); // Debug için

        // Kullanıcıya miktar seçtir
        const { value: miktar } = await Swal.fire({
            title: 'Askıya Bırakılacak Miktar',
            input: 'number',
            inputLabel: 'Miktar',
            inputPlaceholder: 'Askıya bırakılacak ürün miktarını girin',
            inputAttributes: {
                min: 1,
                max: product.stock,
                step: 1
            },
            showCancelButton: true,
            confirmButtonText: 'Askıya Bırak',
            cancelButtonText: 'İptal',
            inputValidator: (value) => {
                if (!value || value < 1) {
                    return 'Lütfen geçerli bir miktar girin!';
                }
                if (value > product.stock) {
                    return 'Stokta yeteri ürün yok!';
                }
            }
        });

        if (!miktar) return; // Kullanıcı iptal ettiyse

        const parsedQuantity = parseInt(miktar);
        const totalAmount = product.data.price * parsedQuantity;

        console.log('Seçilen miktar:', parsedQuantity);
        console.log('Hesaplanan toplam tutar:', totalAmount);

        // Bağış verilerini hazırla
        const donationData = {
            donorId: kurumData._id,
            institutionId: kurumData._id,
            amount: totalAmount,
            status: 'beklemede',
            type: 'kurum',
            donorType: 'institution',
            productsDonated: [{
                productId: product.data._id,
                quantity: parsedQuantity,
                price: product.data.price
            }]
        };

        console.log('Hazırlanan bağış verileri:', donationData);

        // Bağış oluştur
        const askiyaResponse = await fetch('http://localhost:3000/api/donations/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(donationData)
        });

        const responseData = await askiyaResponse.json();
        console.log('API Yanıtı:', responseData); // Debug için

        if (!askiyaResponse.ok) {
            throw new Error(responseData.message || 'Ürün askıya bırakılamadı');
        }

        if (responseData.success) {
            await Swal.fire({
                title: 'Başarılı!',
                text: 'Ürün başarıyla askıya bırakıldı',
                icon: 'success'
            });

            // Ürünleri yeniden yükle
            await loadProducts();
        } else {
            throw new Error(responseData.message || 'Ürün askıya bırakılamadı');
        }

    } catch (error) {
        console.error('Askıya bırakma hatası:', error);
        Swal.fire({
            title: 'Hata!',
            text: error.message || 'Ürün askıya bırakılırken bir hata oluştu',
            icon: 'error'
        });
    }
}

// Tab sistemi için event listener'lar
document.addEventListener('DOMContentLoaded', () => {
    // Rezervasyon tabları için event listener'lar
    const rezervasyonTabButtons = document.querySelectorAll('.rezervasyon-tab-btn');
    rezervasyonTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktif tab'ı değiştir
            document.querySelector('.rezervasyon-tab-btn.active')?.classList.remove('active');
            button.classList.add('active');
            
            // İlgili içeriği göster
            const tabId = button.dataset.tab;
            document.querySelectorAll('.rezervasyon-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-rezervasyonlar`).classList.add('active');
        });
    });

    // Bağış tabları için event listener'lar
    const bagisTabButtons = document.querySelectorAll('.tab-btn');
    bagisTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktif tab'ı değiştir
            document.querySelector('.tab-btn.active')?.classList.remove('active');
            button.classList.add('active');
            
            // İlgili içeriği göster
            const tabId = button.dataset.tab;
            document.querySelectorAll('.bagis-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-bagislar`).classList.add('active');
        });
    });

    // Sayfa yüklendiğinde rezervasyonları yükle
    loadReservations();
});

// Rezervasyonları yükle
async function loadReservations() {
    try {
        const token = localStorage.getItem('token');
        const kurumId = localStorage.getItem('kurumId');

        if (!token || !kurumId) {
            throw new Error('Oturum bilgisi bulunamadı');
        }

        // Tüm rezervasyonları getir
        const response = await fetch(`http://localhost:3000/api/reservations/list?institutionId=${kurumId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Rezervasyonlar alınamadı');
        }

        const result = await response.json();
        console.log('Rezervasyonlar yüklendi:', result);

        if (result.success) {
            // Rezervasyonları global değişkene kaydet
            window.currentReservations = result.data;
            
            // Rezervasyonları görüntüle
            displayReservations(result.data);
            
            // İstatistikleri güncelle
            updateReservationStats(result.data);
        } else {
            throw new Error(result.message || 'Rezervasyonlar alınamadı');
        }

    } catch (error) {
        console.error('Rezervasyonlar yüklenirken hata:', error);
        Swal.fire({
            title: 'Hata!',
            text: 'Rezervasyonlar yüklenirken bir hata oluştu: ' + error.message,
            icon: 'error'
        });
    }
}

// Rezervasyonları görüntüle
function displayReservations(reservations) {
    console.log('Gelen tüm rezervasyonlar:', reservations);

    // Rezervasyonları durumlarına göre ayır
    const aktifReservations = reservations.filter(r => r.status === 'aktif');
    const kullanilanReservations = reservations.filter(r => r.status === 'kullanıldı');
    const iptalReservations = reservations.filter(r => r.status === 'iptal edildi');

    console.log('Rezervasyonlar durumlarına göre ayrıldı:', {
        aktif: aktifReservations.length,
        kullanilan: kullanilanReservations.length,
        iptal: iptalReservations.length,
        durumlar: reservations.map(r => r.status)
    });

    // Aktif rezervasyonları göster
    document.getElementById('bekleyen-rezervasyonlar-body').innerHTML = aktifReservations
        .filter(reservation => reservation.studentId !== null)
        .map(reservation => {
            const productName = reservation.productId?.name || 'Ürün bilgisi bulunamadı';
            const quantity = reservation.quantity || 1;

            return `
                <tr>
                    <td>
                        <i class="fas fa-clock bekleyen-icon" title="Beklemede"></i>
                    </td>
                    <td>${new Date(reservation.date).toLocaleDateString('tr-TR')}</td>
                    <td>${reservation.studentId ? `${reservation.studentId.name} ${reservation.studentId.surname}` : 'Bilinmeyen Kullanıcı'}</td>
                    <td>${productName}</td>
                    <td>${quantity}</td>
                    <td>${new Date(reservation.date).toLocaleTimeString('tr-TR')}</td>
                    <td>
                        <span class="rezervasyon-durum aktif">Aktif</span>
                    </td>
                    <td>
                        <button onclick="showReservationDetails('${reservation._id}')" class="detay-btn">
                            Detay
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

    // Kullanılan rezervasyonları göster
    document.getElementById('onaylanan-rezervasyonlar-body').innerHTML = kullanilanReservations
        .filter(reservation => reservation.studentId !== null)
        .map(reservation => {
            const productName = reservation.productId?.name || 'Ürün bilgisi bulunamadı';
            const quantity = reservation.quantity || 1;

            return `
                <tr>
                    <td>${new Date(reservation.date).toLocaleDateString('tr-TR')}</td>
                    <td>${reservation.studentId ? `${reservation.studentId.name} ${reservation.studentId.surname}` : 'Bilinmeyen Kullanıcı'}</td>
                    <td>${productName}</td>
                    <td>${quantity}</td>
                    <td>${new Date(reservation.date).toLocaleTimeString('tr-TR')}</td>
                    <td>${reservation.usedAt ? new Date(reservation.usedAt).toLocaleString('tr-TR') : '-'}</td>
                    <td>
                        <span class="rezervasyon-durum kullanildi">Kullanıldı</span>
                    </td>
                    <td>
                        <button onclick="showReservationDetails('${reservation._id}')" class="detay-btn">
                            Detay
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

    // İptal edilen rezervasyonları göster
    document.getElementById('iptal-rezervasyonlar-body').innerHTML = iptalReservations
        .filter(reservation => reservation.studentId !== null)
        .map(reservation => {
            const productName = reservation.productId?.name || 'Ürün bilgisi bulunamadı';
            const quantity = reservation.quantity || 1;

            return `
                <tr>
                    <td>${new Date(reservation.date).toLocaleDateString('tr-TR')}</td>
                    <td>${reservation.studentId ? `${reservation.studentId.name} ${reservation.studentId.surname}` : 'Bilinmeyen Kullanıcı'}</td>
                    <td>${productName}</td>
                    <td>${quantity}</td>
                    <td>${new Date(reservation.date).toLocaleTimeString('tr-TR')}</td>
                    <td>${reservation.usedAt ? new Date(reservation.usedAt).toLocaleString('tr-TR') : '-'}</td>
                    <td>
                        <span class="rezervasyon-durum iptal">İptal Edildi</span>
                    </td>
                    <td>
                        <button onclick="showReservationDetails('${reservation._id}')" class="detay-btn">
                            Detay
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

    // İstatistikleri güncelle
    updateReservationStats(reservations);
}

// Rezervasyon istatistiklerini güncelle
function updateReservationStats(reservations) {
    const totalReservations = reservations.length;
    const todayReservations = reservations.filter(r => {
        const today = new Date();
        const reservationDate = new Date(r.date);
        return reservationDate.toDateString() === today.toDateString();
    }).length;
    const pendingReservations = reservations.filter(r => r.status === 'aktif').length;

    document.getElementById('toplam-rezervasyon').textContent = totalReservations;
    document.getElementById('bugun-rezervasyon').textContent = todayReservations;
    document.getElementById('bekleyen-rezervasyon').textContent = pendingReservations;
}

// Rezervasyon detaylarını göster
function showReservationDetails(reservationId) {
    console.log('Rezervasyon detayı açılıyor, ID:', reservationId);

    const reservation = window.currentReservations.find(r => r._id === reservationId);
    if (!reservation) {
        console.error('Rezervasyon bulunamadı');
        Swal.fire({
            title: 'Hata!',
            text: 'Rezervasyon detayları bulunamadı.',
            icon: 'error'
        });
        return;
    }

    // Modal içeriğini doldur
    document.getElementById('musteri-adsoyad').textContent = `${reservation.studentId.name} ${reservation.studentId.surname}`;
    document.getElementById('musteri-telefon').textContent = reservation.studentId.phone || 'Belirtilmemiş';
    document.getElementById('musteri-email').textContent = reservation.studentId.email;

    // Ürün bilgilerini doldur
    document.getElementById('urun-adi').textContent = reservation.productId?.name || 'Ürün bilgisi bulunamadı';
    document.getElementById('urun-miktar').textContent = reservation.quantity || 1;
    document.getElementById('urun-fiyat').textContent = reservation.productId?.price ? `${reservation.productId.price.toFixed(2)} TL` : 'Fiyat bilgisi bulunamadı';

    document.getElementById('rezervasyon-tarihi').textContent = new Date(reservation.date).toLocaleDateString('tr-TR');
    document.getElementById('rezervasyon-saati').textContent = new Date(reservation.date).toLocaleTimeString('tr-TR');
    document.getElementById('kisi-sayisi').textContent = reservation.quantity || 1;
    document.getElementById('rezervasyon-notu').textContent = reservation.note || 'Not bulunmuyor';
    document.getElementById('rezervasyon-durumu').textContent = reservation.status;

    // Durum butonlarını ayarla
    const onaylaBtn = document.getElementById('rezervasyon-onayla');
    const iptalBtn = document.getElementById('rezervasyon-iptal');
    
    if (reservation.status === 'aktif') {
        onaylaBtn.style.display = 'block';
        iptalBtn.style.display = 'block';
        
        // Onaylama butonu click event'i
        onaylaBtn.onclick = () => {
            // Rezervasyon detay modalını kapat
            document.getElementById('rezervasyon-detay-modal').style.display = 'none';
            
            // Doğrulama modalını aç
            const dogrulamaModal = document.getElementById('rezervasyon-dogrulama-modal');
            dogrulamaModal.style.display = 'flex';
            
            // Doğrulama modalı kapatma butonu
            const closeDogrulamaBtn = dogrulamaModal.querySelector('.close-modal');
            closeDogrulamaBtn.onclick = () => {
                dogrulamaModal.style.display = 'none';
                document.getElementById('rezervasyon-detay-modal').style.display = 'flex';
            };

            // İptal butonu
            const dogrulamaIptalBtn = document.getElementById('dogrulama-iptal');
            dogrulamaIptalBtn.onclick = () => {
                dogrulamaModal.style.display = 'none';
                document.getElementById('rezervasyon-detay-modal').style.display = 'flex';
            };

            // Doğrulama onay butonu
            const dogrulamaOnaylaBtn = document.getElementById('dogrulama-onayla');
            dogrulamaOnaylaBtn.onclick = async () => {
                const girilenKod = document.getElementById('verification-code').value;
                
                if (girilenKod === reservation.verificationCode) {
                    try {
                        const response = await fetch('http://localhost:3000/api/reservations/update-status', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({
                                reservationId: reservation._id,
                                status: 'kullanıldı'
                            })
                        });

                        if (!response.ok) {
                            throw new Error('Rezervasyon onaylanırken bir hata oluştu');
                        }

                        // Bağışlanan ürünlerin stoklarını güncelle
                        const products = reservation.products || [];
                        for (const product of products) {
                            if (!product.productId || !product.quantity) continue;

                            const stockResponse = await fetch('http://localhost:3000/api/products/update-stock', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify({
                                    productId: product.productId._id || product.productId,
                                    quantity: product.quantity
                                })
                            });

                            if (!stockResponse.ok) {
                                console.error('Stok güncellenirken hata:', await stockResponse.text());
                                continue;
                            }

                            const stockData = await stockResponse.json();
                            if (!stockData.success) {
                                console.error('Stok güncelleme başarısız:', stockData.message);
                            }
                        }

                        await Swal.fire({
                            title: 'Başarılı!',
                            text: 'Rezervasyon başarıyla onaylandı.',
                            icon: 'success'
                        });

                        // Modalları kapat
                        dogrulamaModal.style.display = 'none';
                        document.getElementById('rezervasyon-detay-modal').style.display = 'none';
                        
                        // Input'u temizle
                        document.getElementById('verification-code').value = '';
                        
                        // Rezervasyonları yeniden yükle
                        await loadReservations();
                    } catch (error) {
                        console.error('Rezervasyon onaylama hatası:', error);
                        Swal.fire({
                            title: 'Hata!',
                            text: 'Rezervasyon onaylanırken bir hata oluştu: ' + error.message,
                            icon: 'error'
                        });
                    }
                } else {
                    Swal.fire({
                        title: 'Hata!',
                        text: 'Doğrulama kodu hatalı!',
                        icon: 'error'
                    });
                }
            };
        };

        // İptal butonu click event'i
        iptalBtn.onclick = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/reservations/update-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        reservationId: reservation._id,
                        status: 'iptal edildi'
                    })
                });

                if (!response.ok) {
                    throw new Error('Rezervasyon iptal edilirken bir hata oluştu');
                }

                await Swal.fire({
                    title: 'Başarılı!',
                    text: 'Rezervasyon başarıyla iptal edildi',
                    icon: 'success'
                });

                // Rezervasyonları yeniden yükle
                await loadReservations();
                
                // Modal'ı kapat
                document.getElementById('rezervasyon-detay-modal').style.display = 'none';
            } catch (error) {
                console.error('Rezervasyon iptal hatası:', error);
                Swal.fire({
                    title: 'Hata!',
                    text: 'Rezervasyon iptal edilirken bir hata oluştu: ' + error.message,
                    icon: 'error'
                });
            }
        };
    } else {
        onaylaBtn.style.display = 'none';
        iptalBtn.style.display = 'none';
    }

    // Modal'ı göster
    const modal = document.getElementById('rezervasyon-detay-modal');
    modal.style.display = 'flex';

    // Modal kapatma butonunu aktifleştir
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // Modal dışına tıklandığında kapatma
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Ürünü askıya bırak
async function askiyaBirak(productId) {
    try {
        const token = localStorage.getItem('token');
        const kurumData = JSON.parse(localStorage.getItem('kurumData'));
        
        if (!token || !kurumData) {
            throw new Error('Oturum bilgisi bulunamadı');
        }

        // Önce ürün bilgilerini al
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ürün bilgileri alınamadı');
        }

        const product = await response.json();
        console.log('Ürün bilgileri:', product); // Debug için

        // Kullanıcıya miktar seçtir
        const { value: miktar } = await Swal.fire({
            title: 'Askıya Bırakılacak Miktar',
            input: 'number',
            inputLabel: 'Miktar',
            inputPlaceholder: 'Askıya bırakılacak ürün miktarını girin',
            inputAttributes: {
                min: 1,
                max: product.stock,
                step: 1
            },
            showCancelButton: true,
            confirmButtonText: 'Askıya Bırak',
            cancelButtonText: 'İptal',
            inputValidator: (value) => {
                if (!value || value < 1) {
                    return 'Lütfen geçerli bir miktar girin!';
                }
                if (value > product.stock) {
                    return 'Stokta yeteri ürün yok!';
                }
            }
        });

        if (!miktar) return; // Kullanıcı iptal ettiyse

        const parsedQuantity = parseInt(miktar);
        const totalAmount = product.data.price * parsedQuantity;

        console.log('Seçilen miktar:', parsedQuantity);
        console.log('Hesaplanan toplam tutar:', totalAmount);

        // Bağış verilerini hazırla
        const donationData = {
            donorId: kurumData._id,
            institutionId: kurumData._id,
            amount: totalAmount,
            status: 'beklemede',
            type: 'kurum',
            donorType: 'institution',
            productsDonated: [{
                productId: product.data._id,
                quantity: parsedQuantity,
                price: product.data.price
            }]
        };

        console.log('Hazırlanan bağış verileri:', donationData);

        // Bağış oluştur
        const askiyaResponse = await fetch('http://localhost:3000/api/donations/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(donationData)
        });

        const responseData = await askiyaResponse.json();
        console.log('API Yanıtı:', responseData); // Debug için

        if (!askiyaResponse.ok) {
            throw new Error(responseData.message || 'Ürün askıya bırakılamadı');
        }

        if (responseData.success) {
            await Swal.fire({
                title: 'Başarılı!',
                text: 'Ürün başarıyla askıya bırakıldı',
                icon: 'success'
            });

            // Ürünleri yeniden yükle
            await loadProducts();
        } else {
            throw new Error(responseData.message || 'Ürün askıya bırakılamadı');
        }

    } catch (error) {
        console.error('Askıya bırakma hatası:', error);
        Swal.fire({
            title: 'Hata!',
            text: error.message || 'Ürün askıya bırakılırken bir hata oluştu',
            icon: 'error'
        });
    }
}
