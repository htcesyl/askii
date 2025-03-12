document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı kontrolü
    const donorData = JSON.parse(localStorage.getItem('donorData'));
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    if (!isLoggedIn || !donorData) {
        window.location.href = 'bagiscigiris.html';
        return;
    }

    if (cart.length === 0) {
        window.location.href = 'menu.html';
        return;
    }

    // Kullanıcı bilgilerini göster
    document.getElementById('userName').textContent = `${donorData.name} ${donorData.surname}`;
    document.getElementById('userEmail').textContent = donorData.email;

    // Sipariş özetini göster
    displayOrderSummary(cart);

    // Kart numarası formatlaması
    document.getElementById('cardNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(.{4})/g, '$1 ').trim();
        e.target.value = value;
    });

    // Son kullanma tarihi formatlaması
    document.getElementById('expiryDate').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0,2) + '/' + value.slice(2);
        }
        e.target.value = value;
    });

    // CVV sadece rakam
    document.getElementById('cvv').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
});

function displayOrderSummary(cart) {
    const container = document.getElementById('orderItems');
    const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Ürünleri işletmelere göre grupla
    const groupedItems = cart.reduce((groups, item) => {
        const institutionId = item.institution?.id;
        if (!groups[institutionId]) {
            groups[institutionId] = {
                name: item.institution?.name || 'Bilinmeyen İşletme',
                items: []
            };
        }
        groups[institutionId].items.push(item);
        return groups;
    }, {});

    // Her işletme için ürünleri listele
    container.innerHTML = Object.entries(groupedItems).map(([institutionId, group]) => `
        <div class="institution-group">
            <div class="institution-header">
                <h3>${group.name}</h3>
            </div>
            ${group.items.map(item => `
                <div class="order-item">
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">x${item.quantity}</span>
                    </div>
                    <span class="item-price">${(item.price * item.quantity).toFixed(2)} TL</span>
                </div>
            `).join('')}
        </div>
    `).join('');

    document.getElementById('totalAmount').textContent = `${totalAmount.toFixed(2)} TL`;
}

function handlePayment(event) {
    event.preventDefault();
    
    // Ödeme simülasyonu
    const loadingButton = document.querySelector('.pay-button');
    loadingButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> İşleminiz Gerçekleştiriliyor...';
    loadingButton.disabled = true;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const donorData = JSON.parse(localStorage.getItem('donorData'));

    // Önce bağışları kaydet
    const donationPromises = cart.map(item => {
        console.log('Processing cart item:', item); // Debug için

        return fetch('http://localhost:3000/api/donations/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                donorId: donorData.id,
                institutionId: item.institution?.id,
                amount: item.price * item.quantity,
                status: 'beklemede',
                type: 'bireysel',
                donorType: 'individual',
                productsDonated: [{
                    productId: item._id,
                    quantity: item.quantity,
                    price: item.price
                }]
            })
        });
    });

    Promise.all(donationPromises)
        .then(responses => Promise.all(responses.map(r => r.json())))
        .then(results => {
            if (results.every(r => r.success)) {
                // Başarılı ödeme simülasyonu
                Swal.fire({
                    icon: 'success',
                    title: 'Ödeme Başarılı!',
                    text: 'Bağışınız için teşekkür ederiz. Anasayfaya yönlendiriliyorsunuz...',
                    timer: 3000,
                    showConfirmButton: false
                }).then(() => {
                    // Sepeti temizle
                    localStorage.removeItem('cart');
                    
                    // Anasayfaya yönlendir
                    window.location.href = 'anasayfa.html';
                });
            } else {
                throw new Error('Bağış kaydedilirken bir hata oluştu');
            }
        })
        .catch(error => {
            console.error('Bağış kaydetme hatası:', error);
            Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: 'Bağışınız kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
                confirmButtonText: 'Tamam'
            });
            loadingButton.innerHTML = '<i class="fas fa-lock"></i> Güvenli Ödeme Yap';
            loadingButton.disabled = false;
        });
}

function handleLogout() {
    localStorage.removeItem('donorData');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'bagiscigiris.html';
} 