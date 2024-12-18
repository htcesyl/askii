// Restoran kartlarına tıklama olaylarını dinliyoruz
document.querySelectorAll('.restaurant-card').forEach((card) => {
    card.addEventListener('click', () => {
      // Restoran ID'sini verinin 'data-id' özelliğinden alıyoruz
      const restaurantId = card.getAttribute('data-id');
  
      if (restaurantId) {
        // Menü sayfasına restoran ID'si ile yönlendir
        window.location.href = `menu.html?restaurantId=${restaurantId}`;
      } else {
        console.error('Restoran ID bulunamadı.');
      }
    });
  });
  