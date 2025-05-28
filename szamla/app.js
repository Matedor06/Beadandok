const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('./util/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Statikus fájlok kiszolgálása
app.use(express.static(path.join(__dirname, 'public')));

// Adatbázis inicializálása
const db = new Database();

// API útvonalak

// Partnerek API
app.get('/api/partners', (req, res) => {
    db.getAllPartners((err, partners) => {
        if (err) {
            console.error('Error fetching partners:', err);
            res.status(500).json({ error: 'Hiba a partnerek lekérése során' });
            return;
        }
        res.json(partners);
    });
});

app.get('/api/partners/:id', (req, res) => {
    const id = req.params.id;
    db.getPartnerById(id, (err, partner) => {
        if (err) {
            console.error('Error fetching partner:', err);
            res.status(500).json({ error: 'Hiba a partner lekérése során' });
            return;
        }
        if (!partner) {
            res.status(404).json({ error: 'Partner nem található' });
            return;
        }
        res.json(partner);
    });
});

app.post('/api/partners', (req, res) => {
    const { name, address, tax_number } = req.body;
    
    if (!name || !address || !tax_number) {
        res.status(400).json({ error: 'Minden mező kitöltése kötelező' });
        return;
    }

    db.createPartner({ name, address, tax_number }, function(err) {
        if (err) {
            console.error('Error creating partner:', err);
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                res.status(400).json({ error: 'Ez az adószám már létezik' });
            } else {
                res.status(500).json({ error: 'Hiba a partner létrehozása során' });
            }
            return;
        }
        res.status(201).json({ id: this.lastID, message: 'Partner sikeresen létrehozva' });
    });
});

// Számlák API
app.get('/api/invoices', (req, res) => {
    db.getAllInvoices((err, invoices) => {
        if (err) {
            console.error('Error fetching invoices:', err);
            res.status(500).json({ error: 'Hiba a számlák lekérése során' });
            return;
        }
        res.json(invoices);
    });
});

app.get('/api/invoices/:id', (req, res) => {
    const id = req.params.id;
    db.getInvoiceById(id, (err, invoice) => {
        if (err) {
            console.error('Error fetching invoice:', err);
            res.status(500).json({ error: 'Hiba a számla lekérése során' });
            return;
        }
        if (!invoice) {
            res.status(404).json({ error: 'Számla nem található' });
            return;
        }
        res.json(invoice);
    });
});

app.get('/api/invoices/next-number', (req, res) => {
    db.getNextInvoiceNumber((err, invoiceNumber) => {
        if (err) {
            console.error('Error getting next invoice number:', err);
            res.status(500).json({ error: 'Hiba a következő számlaszám generálása során' });
            return;
        }
        res.json({ invoice_number: invoiceNumber });
    });
});

app.post('/api/invoices', (req, res) => {
    const {
        invoice_number,
        issuer_id,
        customer_id,
        issue_date,
        delivery_date,
        payment_deadline,
        net_amount,
        vat_rate
    } = req.body;
    
    // Validáció
    if (!invoice_number || !issuer_id || !customer_id || !issue_date || 
        !delivery_date || !payment_deadline || !net_amount || !vat_rate) {
        res.status(400).json({ error: 'Minden mező kitöltése kötelező' });
        return;
    }

    if (isNaN(net_amount) || isNaN(vat_rate)) {
        res.status(400).json({ error: 'Az összegeknek számoknak kell lenniük' });
        return;
    }

    const invoice = {
        invoice_number,
        issuer_id: parseInt(issuer_id),
        customer_id: parseInt(customer_id),
        issue_date,
        delivery_date,
        payment_deadline,
        net_amount: parseFloat(net_amount),
        vat_rate: parseFloat(vat_rate)
    };

    db.createInvoice(invoice, function(err) {
        if (err) {
            console.error('Error creating invoice:', err);
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                res.status(400).json({ error: 'Ez a számlaszám már létezik' });
            } else {
                res.status(500).json({ error: 'Hiba a számla létrehozása során' });
            }
            return;
        }
        res.status(201).json({ id: this.lastID, message: 'Számla sikeresen létrehozva' });
    });
});

// Főoldal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 kezelése
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint nem található' });
});

// Szerver indítása
app.listen(PORT, () => {
    console.log(`Számla kezelő szerver fut a http://localhost:${PORT} címen`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nSzerver leállítása...');
    db.close();
    process.exit(0);
});