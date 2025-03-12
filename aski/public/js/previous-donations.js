// Format date to local string
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get status badge class based on status
function getStatusBadgeClass(status) {
    switch (status) {
        case 'onaylandı':
            return 'status-completed';
        case 'beklemede':
            return 'status-pending';
        case 'iptal edildi':
            return 'status-cancelled';
        default:
            return '';
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Initialize page
async function initializePage() {
    try {
        // Get donor data from localStorage
        const donorDataStr = localStorage.getItem('donorData');
        const isLoggedIn = localStorage.getItem('isLoggedIn');

        console.log('Donor data from localStorage:', donorDataStr); // Debug log

        if (!isLoggedIn || !donorDataStr) {
            console.log('User not logged in, redirecting...'); // Debug log
            window.location.href = 'bagiscigiris.html';
            return;
        }

        const donorData = JSON.parse(donorDataStr);
        console.log('Parsed donor data:', donorData); // Debug log

        if (!donorData || !donorData.id) {
            console.error('Invalid donor data:', donorData);
            throw new Error('Geçersiz kullanıcı bilgileri');
        }

        // Set user information
        const userNameElement = document.getElementById('userName');
        const userEmailElement = document.getElementById('userEmail');
        const donorNameElement = document.getElementById('donorName');

        if (userNameElement && userEmailElement && donorNameElement) {
            userNameElement.textContent = `${donorData.name} ${donorData.surname}`;
            userEmailElement.textContent = donorData.email;
            donorNameElement.textContent = `${donorData.name} ${donorData.surname}`;
        }

        // Fetch donations
        await fetchDonations(donorData.id);
    } catch (error) {
        console.error('Initialization error:', error);
        const tableBody = document.getElementById('donationsTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <div class="donation-row">
                    <div class="donation-cell" style="grid-column: 1 / -1; text-align: center; color: red;">
                        Kullanıcı bilgileri yüklenirken bir hata oluştu: ${error.message}
                    </div>
                </div>
            `;
        }
    }
}

// Fetch and display donations
async function fetchDonations(donorId) {
    try {
        console.log('Fetching donations for donor:', donorId); // Debug log
        
        if (!donorId) {
            throw new Error('Bağışçı ID\'si bulunamadı');
        }

        const response = await fetch(`http://localhost:3000/api/donations/get-user-donations?donorId=${donorId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('API Response status:', response.status); // Debug log

        const data = await response.json();
        console.log('API Response data:', data); // Debug log

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        // Update statistics
        const totalAmountElement = document.getElementById('totalAmount');
        const donationCountElement = document.getElementById('donationCount');
        const institutionCountElement = document.getElementById('institutionCount');
        
        if (totalAmountElement && donationCountElement && institutionCountElement) {
            const totalAmount = data.reduce((sum, donation) => sum + donation.amount, 0);
            console.log('Total amount:', totalAmount); // Debug log
            
            totalAmountElement.textContent = formatCurrency(totalAmount);
            donationCountElement.textContent = data.length;
            
            // Get unique institutions count
            const uniqueInstitutions = new Set(data.map(d => d.institutionName));
            institutionCountElement.textContent = uniqueInstitutions.size;
        }

        // Display donations in table
        const tableBody = document.getElementById('donationsTableBody');
        if (tableBody) {
            tableBody.innerHTML = '';

            if (!data || data.length === 0) {
                tableBody.innerHTML = `
                    <div class="donation-row">
                        <div class="donation-cell" style="grid-column: 1 / -1; text-align: center;">
                            Henüz bağış bulunmamaktadır.
                        </div>
                    </div>
                `;
                return;
            }

            // Group donations by date and institution
            const groupedDonations = data.reduce((acc, donation) => {
                const key = `${donation.date}_${donation.institutionName}`;
                if (!acc[key]) {
                    acc[key] = {
                        date: donation.date,
                        institutionName: donation.institutionName,
                        products: [],
                        totalAmount: 0,
                        status: donation.status
                    };
                }
                
                // Add products and update total amount
                donation.products.forEach(product => {
                    const existingProduct = acc[key].products.find(p => p.name === product.name);
                    if (existingProduct) {
                        existingProduct.quantity += product.quantity;
                    } else {
                        acc[key].products.push({...product});
                    }
                });
                acc[key].totalAmount += donation.amount;
                
                return acc;
            }, {});

            // Convert grouped donations to array and sort by date
            Object.values(groupedDonations)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .forEach(donation => {
                    // Create main donation row
                    const mainRow = document.createElement('div');
                    mainRow.className = 'donation-row';
                    
                    // Create products list HTML
                    const productsHtml = donation.products
                        .map(product => `${product.name} (${product.quantity} adet)`)
                        .join('<br>');
                    
                    mainRow.innerHTML = `
                        <div class="donation-cell">${formatDate(donation.date)}</div>
                        <div class="donation-cell">${donation.institutionName}</div>
                        <div class="donation-cell products-list">${productsHtml}</div>
                        <div class="donation-cell">${donation.products.reduce((sum, p) => sum + p.quantity, 0)} Adet</div>
                        <div class="donation-cell">${formatCurrency(donation.totalAmount)}</div>
                        <div class="donation-cell">
                            <span class="status-badge ${getStatusBadgeClass(donation.status)}">
                                ${donation.status}
                            </span>
                        </div>
                    `;
                    
                    tableBody.appendChild(mainRow);
                });
        }
    } catch (error) {
        console.error('Error fetching donations:', error);
        const tableBody = document.getElementById('donationsTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <div class="donation-row">
                    <div class="donation-cell" style="grid-column: 1 / -1; text-align: center; color: red;">
                        Bağışlar yüklenirken bir hata oluştu: ${error.message}
                    </div>
                </div>
            `;
        }
    }
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...'); // Debug log
    initializePage();
});