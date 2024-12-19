// Modal kontrol
const addProductBtn = document.getElementById('add-product-btn'); // Buton ID eşleşti
const productModal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('close-modal');
const productForm = document.getElementById('product-form');
const productList = document.getElementById('menu-listesi'); // Kartların listelendiği alan

addProductBtn.addEventListener('click', () => {
    productModal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
    productModal.style.display = 'none';
    productForm.reset(); // Formu sıfırla
});

// Menü Ekleme
productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('product-name').value;
    const description = document.getElementById('product-description').value;
    const price = document.getElementById('product-price').value;
    const stock = document.getElementById('product-stock').value;
    const image = document.getElementById('product-image').files[0];

    // Görsel URL'sini geçici olarak oluşturma (front-end için)
    const imageUrl = URL.createObjectURL(image);

    const newProduct = {
        name,
        description,
        price,
        stock,
        profileImageUrl: imageUrl, // Görsel URL
    };

    renderProductCard(newProduct); // Yeni ürünü ekrana ekle
    productModal.style.display = 'none';
    productForm.reset();
});

// Ürün Kartı Oluşturma Fonksiyonu
function renderProductCard(product) {
    const productCard = document.createElement('div');
    productCard.classList.add('menu-karti'); // CSS için uyumlu sınıf
    productCard.innerHTML = `
        <img src="${product.profileImageUrl}" alt="${product.name}" />
        <h4>${product.name}</h4>
        <p>${product.description}</p>
        <p>Fiyat: ${product.price} TL</p>
        <p>Stok: ${product.stock}</p>
    `;
    productList.appendChild(productCard);
}
