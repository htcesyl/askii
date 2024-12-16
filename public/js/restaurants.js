async function showRestaurants() {
    const city = document.getElementById("city").value;
    const district = document.getElementById("district").value;

    if (!city || !district) {
        alert("Lütfen il ve ilçe seçin.");
        return;
    }

    try {
        // API çağrısı
        const response = await fetch(`/api/restaurants?city=${city}&district=${district}`);
        const restaurants = await response.json();

        if (restaurants.length > 0) {
            displayRestaurants(restaurants);
        } else {
            alert("Bu bölgede henüz bir restoran bulunmamaktadır.");
        }
    } catch (error) {
        console.error("Restoranlar getirilirken bir hata oluştu:", error);
    }
}

// Restoranları sayfada görüntüle
function displayRestaurants(restaurants) {
    const restaurantContainer = document.getElementById("restaurant-list");
    restaurantContainer.innerHTML = ""; // Mevcut listeyi temizle

    restaurants.forEach((restaurant) => {
        const restaurantCard = `
            <div class="restaurant-card">
                <h3>${restaurant.name}</h3>
                <p>${restaurant.address}</p>
                <p>${restaurant.phone}</p>
            </div>
        `;
        restaurantContainer.innerHTML += restaurantCard;
    });
}
