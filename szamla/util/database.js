const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, '../data/invoices.db'), (err) => {
            if (err) {
                console.error('Error opening database:', err);
            } else {
                console.log('Connected to SQLite database');
                this.init();
            }
        });
    }

    init() {
        // Partnerek táblája (kiállító és vevő)
        this.db.run(`
            CREATE TABLE IF NOT EXISTS partners (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                address TEXT NOT NULL,
                tax_number TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Számlák táblája
        this.db.run(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_number TEXT NOT NULL UNIQUE,
                issuer_id INTEGER NOT NULL,
                customer_id INTEGER NOT NULL,
                issue_date DATE NOT NULL,
                delivery_date DATE NOT NULL,
                payment_deadline DATE NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                vat_rate DECIMAL(5,2) NOT NULL,
                vat_amount DECIMAL(10,2) NOT NULL,
                net_amount DECIMAL(10,2) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (issuer_id) REFERENCES partners (id),
                FOREIGN KEY (customer_id) REFERENCES partners (id)
            )
        `, (err) => {
            if (err) {
                console.error('Error creating tables:', err);
            } else {
                this.seedData();
            }
        });
    }

    seedData() {
        // Ellenőrizzük, hogy vannak-e már adatok
        this.db.get("SELECT COUNT(*) as count FROM partners", (err, row) => {
            if (err) {
                console.error('Error checking data:', err);
                return;
            }
            
            if (row.count === 0) {
                console.log('Seeding initial data...');
                this.insertInitialData();
            }
        });
    }

    insertInitialData() {
        // Kiállító cég
        this.db.run(`
            INSERT INTO partners (name, address, tax_number) VALUES 
            ('TechSoft Kft.', '1051 Budapest, Arany János u. 32.', '12345678-2-41')
        `, (err) => {
            if (err) console.error('Error inserting issuer:', err);
        });

        // Vevők
        const customers = [
            ['ABC Kereskedelmi Bt.', '1066 Budapest, Teréz krt. 28.', '23456789-2-42'],
            ['XYZ Szolgáltató Kft.', '1074 Budapest, Dohány u. 45.', '34567890-2-43'],
            ['DEF Nagykereskedés Zrt.', '1052 Budapest, Váci u. 12.', '45678901-2-44']
        ];

        customers.forEach(customer => {
            this.db.run(`
                INSERT INTO partners (name, address, tax_number) VALUES (?, ?, ?)
            `, customer, (err) => {
                if (err) console.error('Error inserting customer:', err);
            });
        });

        // Várakozás a partnerek beszúrására, majd számlák létrehozása
        setTimeout(() => {
            this.createSampleInvoices();
        }, 1000);
    }

    createSampleInvoices() {
        // Minta számlák létrehozása
        const invoices = [
            // ABC Kereskedelmi Bt. számláai
            ['SZ-2025-001', 1, 2, '2025-01-15', '2025-01-15', '2025-02-14', 120000, 27],
            ['SZ-2025-002', 1, 2, '2025-02-10', '2025-02-10', '2025-03-12', 85000, 27],
            ['SZ-2025-003', 1, 2, '2025-03-05', '2025-03-05', '2025-04-04', 250000, 27],
            
            // XYZ Szolgáltató Kft. számláai
            ['SZ-2025-004', 1, 3, '2025-01-20', '2025-01-20', '2025-02-19', 150000, 27],
            ['SZ-2025-005', 1, 3, '2025-02-15', '2025-02-15', '2025-03-17', 95000, 27],
            ['SZ-2025-006', 1, 3, '2025-03-10', '2025-03-10', '2025-04-09', 180000, 27],
            
            // DEF Nagykereskedés Zrt. számláai
            ['SZ-2025-007', 1, 4, '2025-01-25', '2025-01-25', '2025-02-24', 320000, 27],
            ['SZ-2025-008', 1, 4, '2025-02-20', '2025-02-20', '2025-03-22', 275000, 27],
            ['SZ-2025-009', 1, 4, '2025-03-15', '2025-03-15', '2025-04-14', 410000, 27]
        ];

        invoices.forEach(invoice => {
            const [invoice_number, issuer_id, customer_id, issue_date, delivery_date, payment_deadline, net_amount, vat_rate] = invoice;
            const vat_amount = Math.round((net_amount * vat_rate / 100) * 100) / 100;
            const total_amount = net_amount + vat_amount;

            this.db.run(`
                INSERT INTO invoices (
                    invoice_number, issuer_id, customer_id, issue_date, 
                    delivery_date, payment_deadline, total_amount, 
                    vat_rate, vat_amount, net_amount
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [invoice_number, issuer_id, customer_id, issue_date, delivery_date, 
                payment_deadline, total_amount, vat_rate, vat_amount, net_amount], 
            (err) => {
                if (err) console.error('Error inserting invoice:', err);
            });
        });

        console.log('Sample data inserted successfully!');
    }

    // Partner műveletek
    getAllPartners(callback) {
        this.db.all("SELECT * FROM partners ORDER BY name", callback);
    }

    getPartnerById(id, callback) {
        this.db.get("SELECT * FROM partners WHERE id = ?", [id], callback);
    }

    createPartner(partner, callback) {
        this.db.run(`
            INSERT INTO partners (name, address, tax_number) VALUES (?, ?, ?)
        `, [partner.name, partner.address, partner.tax_number], callback);
    }

    // Számla műveletek
    getAllInvoices(callback) {
        this.db.all(`
            SELECT i.*, 
                   issuer.name as issuer_name, issuer.address as issuer_address, issuer.tax_number as issuer_tax_number,
                   customer.name as customer_name, customer.address as customer_address, customer.tax_number as customer_tax_number
            FROM invoices i
            JOIN partners issuer ON i.issuer_id = issuer.id
            JOIN partners customer ON i.customer_id = customer.id
            ORDER BY i.invoice_number DESC
        `, callback);
    }

    getInvoiceById(id, callback) {
        this.db.get(`
            SELECT i.*, 
                   issuer.name as issuer_name, issuer.address as issuer_address, issuer.tax_number as issuer_tax_number,
                   customer.name as customer_name, customer.address as customer_address, customer.tax_number as customer_tax_number
            FROM invoices i
            JOIN partners issuer ON i.issuer_id = issuer.id
            JOIN partners customer ON i.customer_id = customer.id
            WHERE i.id = ?
        `, [id], callback);
    }

    createInvoice(invoice, callback) {
        const vat_amount = Math.round((invoice.net_amount * invoice.vat_rate / 100) * 100) / 100;
        const total_amount = invoice.net_amount + vat_amount;

        this.db.run(`
            INSERT INTO invoices (
                invoice_number, issuer_id, customer_id, issue_date, 
                delivery_date, payment_deadline, total_amount, 
                vat_rate, vat_amount, net_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            invoice.invoice_number, invoice.issuer_id, invoice.customer_id,
            invoice.issue_date, invoice.delivery_date, invoice.payment_deadline,
            total_amount, invoice.vat_rate, vat_amount, invoice.net_amount
        ], callback);
    }

    getNextInvoiceNumber(callback) {
        this.db.get(`
            SELECT invoice_number FROM invoices 
            WHERE invoice_number LIKE 'SZ-2025-%' 
            ORDER BY invoice_number DESC LIMIT 1
        `, (err, row) => {
            if (err) {
                callback(err, null);
                return;
            }
            
            let nextNumber = 1;
            if (row && row.invoice_number) {
                const currentNumber = parseInt(row.invoice_number.split('-')[2]);
                nextNumber = currentNumber + 1;
            }
            
            const formattedNumber = `SZ-2025-${nextNumber.toString().padStart(3, '0')}`;
            callback(null, formattedNumber);
        });
    }

    close() {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed');
            }
        });
    }
}

module.exports = Database;