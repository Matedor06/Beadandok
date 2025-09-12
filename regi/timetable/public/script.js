document.addEventListener('DOMContentLoaded', () => {

    const themeSwitch = document.getElementById('themeSwitch');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
    }
    
    themeSwitch.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark-theme' : '';
        localStorage.setItem('theme', currentTheme);
    });
    const form = document.getElementById('lessonForm');
    const timetable = document.getElementById('timetable');
    let editId = null;

    async function loadTimetable() {
        try {
            const response = await fetch('/lessons');
            const lessons = await response.json();

            const days = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek'];
            timetable.innerHTML = days.map(day => `
                <div class="day-column">
                    <h3>${day}</h3>
                    ${lessons.filter(lesson => lesson.day === day)
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(lesson => `
                            <div class="lesson">
                                <span class="delete-btn" onclick="deleteLesson('${lesson.id}')">Törlés</span>
                                <div><strong>${lesson.time}</strong></div>
                                <div>${lesson.subject}</div>
                                ${lesson.classroom ? `<div>${lesson.classroom}</div>` : ''}
                                <button onclick="editLesson('${lesson.id}')">Szerkesztés</button>
                            </div>
                        `).join('')}
                </div>
            `).join('');
        } catch (error) {
            console.log('Hiba történt az órarend betöltésekor:', error);
            alert('Nem sikerült betölteni az órarendet. Kérlek, frissítsd az oldalt.');
        }
    }


    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const lessonData = {
            day: document.getElementById('day').value,
            time: document.getElementById('time').value,
            subject: document.getElementById('subject').value,
            classroom: document.getElementById('classroom').value || null
        };

        const url = editId ? `/lessons/${editId}` : '/lessons';
        const method = editId ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lessonData)
        });

        form.reset();
        editId = null;
        alert('Mentés sikeres!');
        loadTimetable();
    });

    window.editLesson = async (id) => {
        const response = await fetch(`/lessons/${id}`);
        const lesson = await response.json();
        document.getElementById('day').value = lesson.day;
        document.getElementById('time').value = lesson.time;
        document.getElementById('subject').value = lesson.subject;
        document.getElementById('classroom').value = lesson.classroom || '';
        editId = id;
    };

    window.deleteLesson = async (id) => {
        if (!confirm('Biztosan törölni szeretnéd ezt az órát?')) return;
        await fetch(`/lessons/${id}`, { method: 'DELETE' });
        loadTimetable();
    };


    loadTimetable();
});