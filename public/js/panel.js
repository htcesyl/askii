const addProductBtn = document.getElementById('add-product-btn');
const productModal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('close-modal');
const productForm = document.getElementById('product-form');
const productList = document.querySelector('.product-list');

// Modal açma
addProductBtn.addEventListener('click', () => {
    productModal.style.display = 'flex';
});

// Modal kapama
closeModalBtn.addEventListener('click', () => {
    productModal.style.display = 'none';
});

// Ürün ekleme
productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('product-name').value;
    const description = document.getElementById('product-description').value;
    const price = document.getElementById('product-price').value;
    const image = document.getElementById('product-image').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('image', image);

    fetch('/api/products', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            alert('Ürün başarıyla eklendi!');
            productModal.style.display = 'none';
            // Yeni ürünü listeye ekle
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <h3>${data.name}</h3>
                <p>${data.description}</p>
                <p>Fiyat: ${data.price} TL</p>
            `;
            productList.appendChild(productCard);
        })
        .catch(error => console.error('Hata:', error));
});

fetch('/api/products')
    .then(response => response.json())
    .then(data => {
        data.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>Fiyat: ${product.price} TL</p>
            `;
            productList.appendChild(productCard);
        });
    })
    .catch(error => console.error('Hata:', error));