class BlogManager {    constructor() {
        this.baseURL = '/api';
        this.currentEditId = null;
        this.posts = [];
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadData();
    }initializeElements() {
        this.postForm = document.getElementById('post-form');
        this.authorInput = document.getElementById('author');
        this.titleInput = document.getElementById('title');
        this.categorySelect = document.getElementById('category');
        this.contentTextarea = document.getElementById('content');
        this.submitBtn = document.getElementById('submit-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.formTitle = document.getElementById('form-title');
        this.postsContainer = document.getElementById('posts-container');
        this.loadingDiv = document.getElementById('loading');
        this.modal = document.getElementById('modal');
        this.modalMessage = document.getElementById('modal-message');
        this.modalConfirm = document.getElementById('modal-confirm');
        this.modalCancel = document.getElementById('modal-cancel');
    }

    attachEventListeners() {
        this.postForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.cancelBtn.addEventListener('click', () => this.cancelEdit());
        this.modalConfirm.addEventListener('click', () => this.confirmDelete());
        this.modalCancel.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }    async loadData() {
        try {
            await this.loadPosts();
        } catch (error) {
            this.showError('Hiba az adatok betöltése közben');
        }
    }    async loadPosts() {
        try {
            this.loadingDiv.style.display = 'block';
            this.postsContainer.innerHTML = '';

            const response = await fetch(`${this.baseURL}/posts`);
            if (!response.ok) throw new Error('Failed to load posts');
            
            this.posts = await response.json();
            this.renderPosts();
        } catch (error) {
            this.showError('Hiba a blogbejegyzések betöltése közben');
        } finally {
            this.loadingDiv.style.display = 'none';
        }
    }

    renderPosts() {
        if (this.posts.length === 0) {
            this.postsContainer.innerHTML = '<p style="text-align: center; color: #718096; padding: 40px;">Még nincsenek blogbejegyzések.</p>';
            return;
        }

        this.postsContainer.innerHTML = this.posts.map(post => this.createPostCard(post)).join('');
    }    createPostCard(post) {
        const createdDate = new Date(post.created_at).toLocaleDateString('hu-HU');
        const updatedDate = new Date(post.updated_at).toLocaleDateString('hu-HU');
        const wasModified = post.created_at !== post.updated_at;

        return `
            <div class="post-card">
                <div class="post-header">
                    <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                    <div class="post-meta">
                        <span class="post-author">👤 ${this.escapeHtml(post.author_name)}</span>
                        <span class="post-category">${this.escapeHtml(post.category)}</span>
                    </div>
                </div>
                
                <div class="post-content">${this.escapeHtml(post.content)}</div>
                
                <div class="post-dates">
                    <div>📅 Létrehozva: ${createdDate}</div>
                    ${wasModified ? `<div>✏️ Módosítva: ${updatedDate}</div>` : ''}
                </div>
                
                <div class="post-actions">
                    <button class="btn btn-edit" onclick="blogManager.editPost(${post.id})">
                        ✏️ Szerkesztés
                    </button>
                    <button class="btn btn-delete" onclick="blogManager.deletePost(${post.id})">
                        🗑️ Törlés
                    </button>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }    async handleSubmit(e) {
        e.preventDefault();

        const formData = {
            author_name: this.authorInput.value.trim(),
            title: this.titleInput.value.trim(),
            category: this.categorySelect.value,
            content: this.contentTextarea.value.trim()
        };

        if (!this.validateForm(formData)) {
            return;
        }

        try {
            this.submitBtn.disabled = true;
            this.submitBtn.textContent = 'Mentés...';

            let response;
            if (this.currentEditId) {
                // Update existing post
                response = await fetch(`${this.baseURL}/posts/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // Create new post
                response = await fetch(`${this.baseURL}/posts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            }

            if (!response.ok) {
                throw new Error('Failed to save post');
            }

            this.showSuccess(this.currentEditId ? 'Blogbejegyzés sikeresen frissítve!' : 'Blogbejegyzés sikeresen létrehozva!');
            this.resetForm();
            await this.loadPosts();

        } catch (error) {
            this.showError('Hiba a blogbejegyzés mentése közben');
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = this.currentEditId ? 'Frissítés' : 'Létrehozás';
        }
    }    validateForm(formData) {
        if (!formData.author_name) {
            this.showError('A szerző nevének megadása kötelező!');
            return false;
        }
        if (!formData.title) {
            this.showError('A cím megadása kötelező!');
            return false;
        }
        if (!formData.category) {
            this.showError('A kategória kiválasztása kötelező!');
            return false;
        }
        if (!formData.content) {
            this.showError('A tartalom megadása kötelező!');
            return false;
        }
        return true;
    }    async editPost(id) {
        try {
            const response = await fetch(`${this.baseURL}/posts/${id}`);
            if (!response.ok) throw new Error('Failed to load post');
            
            const post = await response.json();
            
            this.currentEditId = id;
            this.authorInput.value = post.author_name;
            this.titleInput.value = post.title;
            this.categorySelect.value = post.category;
            this.contentTextarea.value = post.content;
            
            this.formTitle.textContent = 'Blogbejegyzés Szerkesztése';
            this.submitBtn.textContent = 'Frissítés';
            this.cancelBtn.style.display = 'inline-block';
            
            // Scroll to form
            document.querySelector('.form-section').scrollIntoView({ 
                behavior: 'smooth' 
            });
            
        } catch (error) {
            this.showError('Hiba a blogbejegyzés betöltése közben');
        }
    }

    deletePost(id) {
        const post = this.posts.find(p => p.id === id);
        if (!post) return;

        this.modalMessage.textContent = `Biztosan törölni szeretnéd a "${post.title}" című blogbejegyzést?`;
        this.modal.style.display = 'block';
        this.modalConfirm.onclick = () => this.confirmDelete(id);
    }

    async confirmDelete(id) {
        try {
            const response = await fetch(`${this.baseURL}/posts/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete post');

            this.showSuccess('Blogbejegyzés sikeresen törölve!');
            await this.loadPosts();
        } catch (error) {
            this.showError('Hiba a blogbejegyzés törlése közben');
        } finally {
            this.closeModal();
        }
    }

    cancelEdit() {
        this.resetForm();
    }    resetForm() {
        this.currentEditId = null;
        this.postForm.reset();
        this.formTitle.textContent = 'Új Blogbejegyzés Létrehozása';
        this.submitBtn.textContent = 'Létrehozás';
        this.cancelBtn.style.display = 'none';
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove any existing messages
        const existingMessage = document.querySelector('.success-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;

        const formSection = document.querySelector('.form-section');
        formSection.insertBefore(messageDiv, formSection.firstChild);

        // Auto-remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize the blog manager when the page loads
let blogManager;
document.addEventListener('DOMContentLoaded', () => {
    blogManager = new BlogManager();
});