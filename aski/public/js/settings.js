document.addEventListener('DOMContentLoaded', async function() {
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

    // Form alanlarını doldur
    document.getElementById('name').value = donorData.name;
    document.getElementById('surname').value = donorData.surname;
    document.getElementById('email').value = donorData.email;
    document.getElementById('phone').value = donorData.phone;

    // Profil formu gönderimi
    document.getElementById('profileForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            surname: document.getElementById('surname').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };

        try {
            const response = await fetch(`http://localhost:3000/api/donor/update/${donorData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // LocalStorage'daki bilgileri güncelle
                localStorage.setItem('donorData', JSON.stringify(data.data));
                alert('Profil bilgileriniz başarıyla güncellendi!');
            } else {
                alert(data.message || 'Güncelleme sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error('Güncelleme hatası:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    });

    // Şifre değiştirme formu gönderimi
    document.getElementById('passwordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('Yeni şifreler eşleşmiyor!');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/donor/change-password/${donorData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Şifreniz başarıyla güncellendi!');
                document.getElementById('passwordForm').reset();
            } else {
                alert(data.message || 'Şifre değiştirme sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error('Şifre değiştirme hatası:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    });

    // Bildirim ayarları formu gönderimi
    document.getElementById('notificationForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const emailNotifications = document.getElementById('emailNotifications').checked;
        const smsNotifications = document.getElementById('smsNotifications').checked;

        try {
            const response = await fetch(`http://localhost:3000/api/donor/notifications/${donorData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailNotifications,
                    smsNotifications
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Bildirim tercihleriniz güncellendi!');
            } else {
                alert(data.message || 'Bildirim ayarları güncellenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Bildirim ayarları güncelleme hatası:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    });
}); 