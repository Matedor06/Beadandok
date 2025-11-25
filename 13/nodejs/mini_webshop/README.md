# Mini Webshop

Egy teljes funkcionalitású mini webshop Node.js-szel és SQLite adatbázissal.

## Funkciók

### Backend API végpontok:
- `GET /api/products` - Összes termék lekérése
- `POST /api/cart` - Termék hozzáadása a kosárhoz
- `GET /api/cart` - Kosár tartalmának lekérése
- `POST /api/checkout` - Rendelés leadása
- `POST /api/auth/register` - Regisztráció
- `POST /api/auth/login` - Bejelentkezés
- `GET /api/auth/me` - Felhasználói adatok lekérése
- `PUT /api/auth/me` - Email módosítása

**Admin végpontok** (admin jogosultság szükséges):
- `POST /api/admin/products` - Új termék hozzáadása
- `PUT /api/admin/products/:id` - Termék módosítása
- `DELETE /api/admin/products/:id` - Termék törlése
- `GET /api/admin/stats` - Statisztikák lekérése

### Adatbázis táblák:
- `users` - Felhasználók (id, email, password_hash)
- `products` - Termékek (id, name, price, stock)
- `cart_items` - Kosár elemek (user_id, product_id, quantity)
- `orders` - Rendelések (id, user_id, total, created_at)
- `order_items` - Rendelés tételek

### Frontend oldalak:
- ✅ Login / Register oldal
- ✅ Terméklista
- ✅ Kosár kezelés
- ✅ Rendelések megtekintése
- ✅ Saját adatok szerkesztése
- ✅ **Admin Panel** (csak adminoknak)
  - Statisztikák (felhasználók, termékek, rendelések, bevétel)
  - Termékek hozzáadása
  - Termékek szerkesztése
  - Termékek törlése

## Telepítés

1. Függőségek telepítése:
```bash
npm install
```

2. Szerver indítása:
```bash
npm start
```

Vagy fejlesztői módban (automatikus újraindítással):
```bash
npm run dev
```

3. Nyisd meg a böngészőben:
```
http://localhost:3000
```

## Használat

### Normál felhasználó:
1. **Regisztráció**: Hozz létre egy új felhasználói fiókot
2. **Bejelentkezés**: Jelentkezz be az email címeddel és jelszavaddal
3. **Termékek böngészése**: Nézd meg az elérhető termékeket
4. **Kosárba helyezés**: Add hozzá a termékeket a kosaradhoz
5. **Rendelés**: Add le a rendelésedet
6. **Profil**: Módosítsd az email címedet

### Admin felhasználó:
**Bejelentkezési adatok:**
- 📧 Email: `admin@webshop.hu`
- 🔑 Jelszó: `admin123`

**Admin funkciók:**
- 📊 Statisztikák megtekintése (felhasználók, termékek, rendelések, bevétel)
- ➕ Új termékek hozzáadása
- ✏️ Meglévő termékek szerkesztése
- 🗑️ Termékek törlése

**Admin felhasználó létrehozása:**
```bash
node create-admin.js
```

## Technológiák

- **Backend**: Node.js, Express
- **Adatbázis**: SQLite3
- **Autentikáció**: JWT, bcryptjs
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## Jellemzők

- 🔐 Biztonságos jelszó tárolás (bcrypt)
- 🎫 JWT token alapú autentikáció
- 👑 **Admin szerepkör és jogosultságkezelés**
- 🛒 Valós idejű kosár kezelés
- 📦 Készlet követés
- 💰 Rendelés előzmények
- 📊 **Admin statisztikák és termékkezelés**
- 📱 Reszponzív design
- ✨ Modern, elegáns UI

## Minta termékek

Az adatbázis automatikusan feltöltődik minta termékekkel:
- Laptop, Smartphone, Headphones, Tablet, Smartwatch, Keyboard, Mouse, Monitor

## Környezeti változók

A `.env` fájlban állíthatók be:
- `PORT` - Szerver port (alapértelmezett: 3000)
- `JWT_SECRET` - JWT token titkosítási kulcs
