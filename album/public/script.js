document.addEventListener('DOMContentLoaded', () => {
    // Téma váltó inicializálása
    const themeSwitch = document.getElementById('themeSwitch');
    const savedTheme = localStorage.getItem('theme');
    // Alapértelmezett téma betöltése
    if (savedTheme) {
        document.body.classList.add(savedTheme);
    }

    // Téma váltás eseménykezelő
    themeSwitch.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark-theme' : '';
        localStorage.setItem('theme', currentTheme);
    });
    const form = document.getElementById('albumForm');
    const albumContainer = document.getElementById('albumContainer');
    const formTitle = document.getElementById('form-title');
    const cancelBtn = document.getElementById('cancelBtn');
    let currentAlbumId = null;

    // Albumok betöltése
    async function loadAlbums() {
        try {
            const response = await fetch('/albums');
            const albums = await response.json();

            albumContainer.innerHTML = albums.map(album => `
                <div class="album-card" data-id="${album.id}">
                    <h3>${album.title}</h3>
                    <p><strong>Zenekar:</strong> ${album.band}</p>
                    <p><strong>Megjelenés éve:</strong> ${album.year}</p>
                    <p><strong>Műfaj:</strong> ${album.genre}</p>
                    ${album.rating ? `<p class="rating"><strong>Értékelés:</strong> ${album.rating}/10</p>` : ''}
                    <div class="card-actions">
                        <button onclick="editAlbum('${album.id}')">Szerkesztés</button>
                        <button class="delete-btn" onclick="deleteAlbum('${album.id}')">Törlés</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Hiba az albumok betöltésekor:', error);
        }
    }

    // Űrlap kezelése
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const albumData = {
            band: document.getElementById('band').value,
            title: document.getElementById('title').value,
            year: parseInt(document.getElementById('year').value),
            genre: document.getElementById('genre').value,
            rating: parseFloat(document.getElementById('rating').value) || null
        };

        try {
            const url = currentAlbumId ? `/albums/${currentAlbumId}` : '/albums';
            const method = currentAlbumId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(albumData)
            });

            if (!response.ok) {
                throw new Error('Hiba a mentés során');
            }

            resetForm();
            alert('Mentés sikeres!');
            loadAlbums();
        } catch (error) {
            console.error('Hiba:', error);
            alert('Hiba történt a mentés során');
        }
    });

    // Űrlap visszaállítása
    function resetForm() {
        form.reset();
        currentAlbumId = null;
        formTitle.textContent = 'Új Album Hozzáadása';
        cancelBtn.style.display = 'none';
    }

    // Szerkesztés
    window.editAlbum = async (id) => {
        try {
            const response = await fetch(`/albums/${id}`);
            const album = await response.json();

            document.getElementById('albumId').value = album.id;
            document.getElementById('band').value = album.band;
            document.getElementById('title').value = album.title;
            document.getElementById('year').value = album.year;
            document.getElementById('genre').value = album.genre;
            document.getElementById('rating').value = album.rating || '';

            currentAlbumId = album.id;
            formTitle.textContent = 'Album Szerkesztése';
            cancelBtn.style.display = 'block';
        } catch (error) {
            console.error('Hiba a szerkesztés során:', error);
        }
    };

    // Törlés
    window.deleteAlbum = async (id) => {
        if (!confirm('Biztosan törölni szeretnéd ezt az albumot?')) return;

        try {
            const response = await fetch(`/albums/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Hiba a törlés során');
            }

            loadAlbums();
        } catch (error) {
            console.error('Hiba a törlés során:', error);
            alert('Hiba történt a törlés során');
        }
    };

    // Mégse gomb
    cancelBtn.addEventListener('click', resetForm);

    // Kezdeti betöltés
    loadAlbums();
});