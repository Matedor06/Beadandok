document.addEventListener('DOMContentLoaded', function () {
    // Albumok listázása
    function fetchAlbums() {
      fetch('/albums')
        .then(response => response.json())
        .then(data => {
          const albumList = document.getElementById('albumList');
          albumList.innerHTML = '';
          data.forEach(album => {
            const li = document.createElement('li');
            li.innerHTML = `
              <span>${album.band} - ${album.title} (${album.release_year})</span>
              <button onclick="deleteAlbum(${album.id})">Törlés</button>
            `;
            albumList.appendChild(li);
          });
        })
        .catch(error => console.error('Hiba történt az albumok lekérésekor:', error));
    }
  
    // Album hozzáadása
    const albumForm = document.getElementById('albumForm');
    albumForm.addEventListener('submit', function (event) {
      event.preventDefault();
  
      const band = document.getElementById('band').value;
      const title = document.getElementById('title').value;
      const releaseYear = document.getElementById('releaseYear').value;
      const genre = document.getElementById('genre').value;
  
      const albumData = { band, title, release_year: releaseYear, genre };
  
      fetch('/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(albumData),
      })
        .then(response => response.json())
        .then(() => {
          fetchAlbums(); // Albumok frissítése
          albumForm.reset();
        })
        .catch(error => console.error('Hiba történt az album hozzáadásakor:', error));
    });
  
    // Albumok törlése
    function deleteAlbum(id) {
      fetch(`/albums/${id}`, { method: 'DELETE' })
        .then(() => fetchAlbums())
        .catch(error => console.error('Hiba történt az album törlésénél:', error));
    }
  
    // Indításkor albumok listázása
    fetchAlbums();
  });
  