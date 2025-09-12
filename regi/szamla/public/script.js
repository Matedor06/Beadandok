// API endpoint
const API_BASE = '';

// Global variables
let invoices = [];
let partners = [];

// DOM elements
const loadingEl = document.getElementById('loading');
const toastContainer = document.getElementById('toast-container');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    showLoading();
    try {
        await loadPartners();
        await loadInvoices();
        populatePartnerSelects();
        setDefaultDates();
        setupEventListeners();
    } catch (error) {
        showToast('Hiba történt az alkalmazás inicializálása során', 'error');
        console.error('Initialization error:', error);
    } finally {
        hideLoading();
    }
}

// Event listeners
function setupEventListeners() {
    // Invoice form
    const invoiceForm = document.getElementById('invoice-form');
    invoiceForm.addEventListener('submit', handleInvoiceSubmit);

    // Partner form
    const partnerForm = document.getElementById('partner-form');
    partnerForm.addEventListener('submit', handlePartnerSubmit);

    // Invoice calculation
    const netAmountInput = document.getElementById('net-amount');
    const vatRateSelect = document.getElementById('vat-rate');
    
    netAmountInput.addEventListener('input', calculateInvoiceTotal);
    vatRateSelect.addEventListener('change', calculateInvoiceTotal);

    // Auto-fill delivery date when issue date changes
    const issueDateInput = document.getElementById('issue-date');
    const deliveryDateInput = document.getElementById('delivery-date');
    
    issueDateInput.addEventListener('change', function() {
        if (!deliveryDateInput.value) {
            deliveryDateInput.value = this.value;
        }
    });
}

// Tab management
function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all nav buttons
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked nav button
    const clickedBtn = event.target.closest('.nav-btn');
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }

    // Refresh data when switching to data tabs
    if (tabName === 'invoices') {
        loadInvoices();
    } else if (tabName === 'partners') {
        loadPartners();
    }
}

// API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(API_BASE + endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Hiba történt a kérés során');
        }

        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Data loading functions
async function loadInvoices() {
    try {
        showLoading();
        invoices = await apiCall('/api/invoices');
        renderInvoicesTable();
    } catch (error) {
        showToast('Hiba történt a számlák betöltése során: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function loadPartners() {
    try {
        showLoading();
        partners = await apiCall('/api/partners');
        renderPartnersTable();
    } catch (error) {
        showToast('Hiba történt a partnerek betöltése során: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Rendering functions
function renderInvoicesTable() {
    const tbody = document.getElementById('invoices-tbody');
    tbody.innerHTML = '';

    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${invoice.invoice_number}</td>
            <td>${invoice.issuer_name}</td>
            <td>${invoice.customer_name}</td>
            <td>${formatDate(invoice.issue_date)}</td>
            <td>${formatDate(invoice.payment_deadline)}</td>
            <td class="number">${formatCurrency(invoice.net_amount)}</td>
            <td class="number">${invoice.vat_rate}%</td>
            <td class="number">${formatCurrency(invoice.total_amount)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-primary" onclick="viewInvoiceDetails(${invoice.id})">
                        <i class="fas fa-eye"></i> Részletek
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function renderPartnersTable() {
    const tbody = document.getElementById('partners-tbody');
    tbody.innerHTML = '';

    partners.forEach(partner => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${partner.name}</td>
            <td>${partner.address}</td>
            <td>${partner.tax_number}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-primary" onclick="viewPartnerDetails(${partner.id})">
                        <i class="fas fa-eye"></i> Részletek
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Form handling
async function handleInvoiceSubmit(event) {
    event.preventDefault();
    
    try {
        showLoading();
        const formData = new FormData(event.target);
        const invoiceData = Object.fromEntries(formData.entries());
        
        await apiCall('/api/invoices', {
            method: 'POST',
            body: JSON.stringify(invoiceData)
        });

        showToast('Számla sikeresen létrehozva!', 'success');
        resetInvoiceForm();
        await loadInvoices();
        showTab('invoices');
    } finally {
        hideLoading();
    }
}

async function handlePartnerSubmit(event) {
    event.preventDefault();
    
    try {
        showLoading();
        const formData = new FormData(event.target);
        const partnerData = Object.fromEntries(formData.entries());
        
        await apiCall('/api/partners', {
            method: 'POST',
            body: JSON.stringify(partnerData)
        });

        showToast('Partner sikeresen létrehozva!', 'success');
        event.target.reset();
        await loadPartners();
        populatePartnerSelects();
        showTab('partners');

    } finally {
        hideLoading();
    }
}

// Helper functions
function populatePartnerSelects() {
    const issuerSelect = document.getElementById('issuer-select');
    const customerSelect = document.getElementById('customer-select');
    
    // Clear existing options
    issuerSelect.innerHTML = '<option value="">Válasszon kiállítót...</option>';
    customerSelect.innerHTML = '<option value="">Válasszon vevőt...</option>';
    
    partners.forEach(partner => {
        const option = `<option value="${partner.id}">${partner.name}</option>`;
        issuerSelect.innerHTML += option;
        customerSelect.innerHTML += option;
    });
}

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const paymentDeadline = oneMonthLater.toISOString().split('T')[0];
    
    document.getElementById('issue-date').value = today;
    document.getElementById('delivery-date').value = today;
    document.getElementById('payment-deadline').value = paymentDeadline;
}

function calculateInvoiceTotal() {
    const netAmount = parseFloat(document.getElementById('net-amount').value) || 0;
    const vatRate = parseFloat(document.getElementById('vat-rate').value) || 0;
    
    const vatAmount = netAmount * (vatRate / 100);
    const totalAmount = netAmount + vatAmount;
    
    document.getElementById('summary-net').textContent = formatCurrency(netAmount);
    document.getElementById('summary-vat').textContent = formatCurrency(vatAmount);
    document.getElementById('summary-total').textContent = formatCurrency(totalAmount);
}

async function generateInvoiceNumber() {
    try {
        showLoading();
        const response = await apiCall('/api/invoices/next-number');
        document.getElementById('invoice-number').value = response.invoice_number;
    } catch (error) {
        showToast('Hiba történt a számlaszám generálása során: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function resetInvoiceForm() {
    document.getElementById('invoice-form').reset();
    setDefaultDates();
    calculateInvoiceTotal();
}

// Detail views
async function viewInvoiceDetails(invoiceId) {
    try {
        showLoading();
        const invoice = await apiCall(`/api/invoices/${invoiceId}`);
        
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = `Számla részletei - ${invoice.invoice_number}`;
        
        modalBody.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Számlaszám:</span>
                    <span class="detail-value">${invoice.invoice_number}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Kiállítás dátuma:</span>
                    <span class="detail-value">${formatDate(invoice.issue_date)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Teljesítés dátuma:</span>
                    <span class="detail-value">${formatDate(invoice.delivery_date)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Fizetési határidő:</span>
                    <span class="detail-value">${formatDate(invoice.payment_deadline)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Kiállító:</span>
                    <span class="detail-value">${invoice.issuer_name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Kiállító címe:</span>
                    <span class="detail-value">${invoice.issuer_address}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Kiállító adószáma:</span>
                    <span class="detail-value">${invoice.issuer_tax_number}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Vevő:</span>
                    <span class="detail-value">${invoice.customer_name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Vevő címe:</span>
                    <span class="detail-value">${invoice.customer_address}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Vevő adószáma:</span>
                    <span class="detail-value">${invoice.customer_tax_number}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Nettó összeg:</span>
                    <span class="detail-value">${formatCurrency(invoice.net_amount)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">ÁFA kulcs:</span>
                    <span class="detail-value">${invoice.vat_rate}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">ÁFA összeg:</span>
                    <span class="detail-value">${formatCurrency(invoice.vat_amount)}</span>
                </div>
                <div class="detail-item" style="border-top: 2px solid #dee2e6; padding-top: 15px; font-weight: bold;">
                    <span class="detail-label">Végösszeg:</span>
                    <span class="detail-value" style="color: #28a745;">${formatCurrency(invoice.total_amount)}</span>
                </div>
            </div>
        `;
        
        showModal();
    } catch (error) {
        showToast('Hiba történt a számla részleteinek betöltése során: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function viewPartnerDetails(partnerId) {
    try {
        showLoading();
        const partner = await apiCall(`/api/partners/${partnerId}`);
        
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = `Partner részletei - ${partner.name}`;
        
        modalBody.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Név:</span>
                    <span class="detail-value">${partner.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Cím:</span>
                    <span class="detail-value">${partner.address}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Adószám:</span>
                    <span class="detail-value">${partner.tax_number}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Létrehozva:</span>
                    <span class="detail-value">${formatDateTime(partner.created_at)}</span>
                </div>
            </div>
        `;
        
        showModal();
    } catch (error) {
        showToast('Hiba történt a partner részleteinek betöltése során: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Modal functions
function showModal() {
    document.getElementById('detail-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('detail-modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('detail-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('hu-HU');
}

function formatDateTime(dateTimeString) {
    return new Date(dateTimeString).toLocaleString('hu-HU');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('hu-HU', {
        style: 'currency',
        currency: 'HUF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function showLoading() {
    loadingEl.classList.add('show');
}

function hideLoading() {
    loadingEl.classList.remove('show');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
    
    // Remove on click
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}