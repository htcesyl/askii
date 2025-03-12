let cart = [];
let menuItems = [];

// Backend URL'sini tanımla
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000'
    : 'https://4593-151-135-135-224.ngrok-free.app'; // Ngrok URL'nizi buraya yazın

document.addEventListener('DOMContentLoaded', async function() {
    // Sepeti localStorage'dan yükle
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }

    // Kullanıcı kontrolü
    const donorData = JSON.parse(localStorage.getItem('donorData'));
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!isLoggedIn || !donorData) {
        window.location.href = 'bagiscigiris.html';
        return;
    }

    // Kullanıcı bilgilerini göster
    document.getElementById('userName').textContent = `${donorData.name} ${donorData.surname}`;
    document.getElementById('userEmail').textContent = donorData.email;

    // İşletme bilgilerini al
    const institutionId = localStorage.getItem('selectedInstitutionId');
    const institutionName = localStorage.getItem('selectedInstitutionName');
    
    if (!institutionId) {
        window.location.href = 'restaurants.html';
        return;
    }

    try {
        // İşletme bilgilerini getir
        const institutionResponse = await fetch(`${BACKEND_URL}/api/institution/get?id=${institutionId}`);
        const institutionData = await institutionResponse.json();

        if (!institutionResponse.ok) {
            throw new Error(institutionData.message || 'İşletme bilgileri alınamadı');
        }

        if (institutionData.success) {
            displayInstitutionInfo(institutionData.data);

            // İşletmenin ürünlerini getir
            const productsResponse = await fetch(`${BACKEND_URL}/api/products/list?institutionId=${institutionId}`);
            const productsData = await productsResponse.json();

            if (!productsResponse.ok) {
                throw new Error(productsData.message || 'Ürünler alınamadı');
            }

            if (productsData.success) {
                menuItems = productsData.data;
                displayMenuItems(menuItems);
            } else {
                throw new Error(productsData.message);
            }
        } else {
            throw new Error(institutionData.message);
        }
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        document.getElementById('menuItems').innerHTML = `
            <div class="error-message">
                <h3>Bir hata oluştu</h3>
                <p>${error.message || 'Veriler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.'}</p>
                <p><small>Hata detayı: ${error.toString()}</small></p>
            </div>
        `;
    }
});

function displayInstitutionInfo(institution) {
    document.getElementById('institutionName').textContent = institution.name;
    document.getElementById('institutionAddress').textContent = 
        `${institution.address.street || ''}, ${institution.address.district}, ${institution.address.city}`;
    document.getElementById('institutionHours').textContent = institution.openingHours || 'Belirtilmemiş';
    document.getElementById('institutionPhone').textContent = institution.phone || 'Belirtilmemiş';
    
    if (institution.profileImageUrl) {
        document.getElementById('institutionImage').src = institution.profileImageUrl;
    }
}

function displayMenuItems(items) {
    const container = document.getElementById('menuItems');
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="no-items">
                <p>Henüz menüye ürün eklenmemiş.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="menu-item">
            <div class="item-image">
                <div class="stock-label">Stok: ${item.stock}</div>
                <img src="${item.profileImageUrl ? `${BACKEND_URL}${item.profileImageUrl}` : '../public/image/logo.png'}" 
                     alt="${item.name}"
                     onerror="this.src='../public/image/logo.png'">
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="description">${item.description || ''}</p>
                <div class="price-row">
                    <span class="price">${item.price} TL</span>
                    <button onclick="addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function addToCart(item) {
    const existingItemIndex = cart.findIndex(cartItem => cartItem._id === item._id);
    
    // İşletme bilgisini ekle
    const currentInstitution = {
        id: localStorage.getItem('selectedInstitutionId'),
        name: localStorage.getItem('selectedInstitutionName')
    };
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.unshift({ 
            ...item, 
            quantity: 1,
            institution: currentInstitution
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    // Update cart count in the topbar
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

function removeFromCart(itemId) {
    const index = cart.findIndex(item => item._id === itemId);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function clearCart() {
    cart = [];
    localStorage.removeItem('cart');
    updateCartDisplay();
}

function updateCartDisplay() {
    const container = document.getElementById('cartItems');
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p>Sepetiniz boş</p>
            </div>
        `;
    } else {
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
            <div class="cart-group">
                <div class="cart-group-header">
                    ${group.name}
                </div>
                ${group.items.map(item => `
                    <div class="cart-item">
                        <div class="item-info">
                            <h4>${item.name}</h4>
                            <div class="item-details">
                                <span class="price">${(item.price * item.quantity).toFixed(2)} TL</span>
                            </div>
                        </div>
                        <div class="quantity-controls">
                            <button onclick="removeFromCart('${item._id}')">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" 
                                   value="${item.quantity}" 
                                   min="1" 
                                   onchange="updateQuantity('${item._id}', this.value)"
                                   class="quantity-input">
                            <button onclick="addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button onclick="deleteFromCart('${item._id}')" class="delete-btn">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    document.getElementById('totalPrice').textContent = `${totalPrice.toFixed(2)} TL`;
    document.getElementById('checkout').disabled = cart.length === 0;
}

function updateQuantity(itemId, newQuantity) {
    const index = cart.findIndex(item => item._id === itemId);
    if (index !== -1) {
        const quantity = Math.max(1, parseInt(newQuantity) || 1);
        cart[index].quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }
}

function deleteFromCart(itemId) {
    const index = cart.findIndex(item => item._id === itemId);
    if (index !== -1) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }
}

function filterProducts(category) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const filteredItems = category === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === category);
    
    displayMenuItems(filteredItems);
}

function handleLogout() {
    localStorage.removeItem('donorData');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'bagiscigiris.html';
}

// Arama fonksiyonu
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredItems = menuItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        (item.description && item.description.toLowerCase().includes(searchTerm))
    );
    displayMenuItems(filteredItems);
});

function checkout() {
    if (cart.length === 0) {
        alert('Sepetiniz boş!');
        return;
    }
    window.location.href = 'payment.html';
}
