



/* rotaya dahil ettim*/
const restaurantRoutes = require("./routes/restaurants");
app.use("/api/restaurants", restaurantRoutes);




// Restoranları listeleyen fonksiyon
function displayRestaurants(city, district) {
    const restaurants = {
        ankara: {
            çankaya: ["Restoran A", "Restoran B"],
            keçiören: ["Restoran C", "Restoran D"],
        },
        istanbul: {
            beşiktaş: ["Restoran E", "Restoran F"],
            kadıköy: ["Restoran G", "Restoran H"],
        },
        konya: {
            selçuklu: ["Restoran I", "Restoran J"],
            karatay: ["Restoran K", "Restoran L"],
        },
    };

    // Seçili il ve ilçeye göre restoranları al
    const selectedRestaurants =
        restaurants[city]?.[district] || ["Restoran bulunamadı"];

    // Restoran listesini oluştur
    const container = document.getElementById("restaurants-container");
    container.innerHTML = ""; // Mevcut listeyi temizle

    selectedRestaurants.forEach((restaurant) => {
        const card = document.createElement("div");
        card.className = "restaurant-card";
        card.innerHTML = `
            <h3>${restaurant}</h3>
            <p>${district}, ${city}</p>
        `;
        container.appendChild(card);
    });
}

// "Keşfetmeye Başla" butonu ile entegre et
document.querySelector(".donate-btn").addEventListener("click", () => {
    const city = document.getElementById("city").value;
    const district = document.getElementById("district").value;

    if (city && district) {
        displayRestaurants(city, district);
    } else {
        alert("Lütfen il ve ilçe seçin.");
    }
});



