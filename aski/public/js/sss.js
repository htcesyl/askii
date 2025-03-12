document.addEventListener('DOMContentLoaded', function() {
    const faqBoxes = document.querySelectorAll('.faq-box');
    
    faqBoxes.forEach(box => {
        box.querySelector('.faq-title').addEventListener('click', () => {
            // Sadece tıklanan kutunun durumunu değiştir
            box.classList.toggle('active');
            
            // Diğer kutuları kapatma kodu kaldırıldı
            // faqBoxes.forEach(b => {
            //     if (b !== box) b.classList.remove('active');
            // });
        });
    });
}); 