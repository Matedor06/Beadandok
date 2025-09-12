class BlogManager {    constructor() {
        this.baseURL = '/api';
        this.currentEditId = null;
        this.posts = [];
        this.users = [];
        this.filteredPosts = [];
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadData();
    }

    initializeElements() {
        // Post form elements
        this.postForm = document.getElementById('post-form');
        this.authorSelect = document.getElementById('author-select');
        this.titleInput = document.getElementById('title');
        this.categorySelect = document.getElementById('category');
        this.contentTextarea = document.getElementById('content');
        this.submitBtn = document.getElementById('submit-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.formTitle = document.getElementById('form-title');
        this.postsContainer = document.getElementById('posts-container');
        this.loadingDiv = document.getElementById('loading');
          // User form elements
        this.userForm = document.getElementById('user-form');
        this.userNameInput = document.getElementById('user-name');
        this.userEmailInput = document.getElementById('user-email');
        this.userSubmitBtn = document.getElementById('user-submit-btn');
        this.usersContainer = document.getElementById('users-container');
        this.usersLoadingDiv = document.getElementById('users-loading');
        
        // Filter elements
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.categoryFilter = document.getElementById('category-filter');
        this.authorFilter = document.getElementById('author-filter');
        
        // Modal elements
        this.modal = document.getElementById('modal');
        this.modalMessage = document.getElementById('modal-message');
        this.modalConfirm = document.getElementById('modal-confirm');
        this.modalCancel = document.getElementById('modal-cancel');
    }    attachEventListeners() {
        this.postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
        this.userForm.addEventListener('submit', (e) => this.handleUserSubmit(e));
        this.cancelBtn.addEventListener('click', () => this.cancelEdit());
        this.modalConfirm.addEventListener('click', () => this.confirmDelete());
        this.modalCancel.addEventListener('click', () => this.closeModal());
        
        // Filter event listeners
        this.searchBtn.addEventListener('click', () => this.applyFilters());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.applyFilters();
        });
        this.categoryFilter.addEventListener('change', () => this.applyFilters());
        this.authorFilter.addEventListener('change', () => this.applyFilters());
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    async loadData() {
        try {
            await Promise.all([
                this.loadPosts(),
                this.loadUsers()
            ]);
        } catch (error) {
            this.showError('Hiba az adatok betöltése közben');
        }
    }

    async loadPosts() {
        try {
            this.loadingDiv.style.display = 'block';
            this.postsContainer.innerHTML = '';

            const response = await fetch(`${this.baseURL}/posts`);
            if (!response.ok) throw new Error('Failed to load posts');
              this.posts = await response.json();
            this.filteredPosts = [...this.posts];
            this.renderPosts();
        } catch (error) {
            this.showError('Hiba a blogbejegyzések betöltése közben');
        } finally {
            this.loadingDiv.style.display = 'none';
        }
    }

    async loadUsers() {
        try {
            this.usersLoadingDiv.style.display = 'block';
            this.usersContainer.innerHTML = '';

            const response = await fetch(`${this.baseURL}/users`);
            if (!response.ok) throw new Error('Failed to load users');
            
            this.users = await response.json();
            this.renderUsers();
            this.populateUserSelect();
        } catch (error) {
            this.showError('Hiba a felhasználók betöltése közben');
        } finally {
            this.usersLoadingDiv.style.display = 'none';
        }
    }    populateUserSelect() {
        this.authorSelect.innerHTML = '<option value="">Válassz szerzőt...</option>';
        this.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            this.authorSelect.appendChild(option);
        });
        
        // Also populate the author filter
        this.authorFilter.innerHTML = '<option value="">Minden szerző</option>';
        this.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            this.authorFilter.appendChild(option);
        });
    }    renderPosts() {
        if (this.filteredPosts.length === 0) {
            this.postsContainer.innerHTML = '<p style="text-align: center; color: #718096; padding: 40px;">Nincsenek megjelenítendő blogbejegyzések.</p>';
            return;
        }

        this.postsContainer.innerHTML = this.filteredPosts.map(post => this.createPostCard(post)).join('');
    }

    renderUsers() {
        if (this.users.length === 0) {
            this.usersContainer.innerHTML = '<p style="text-align: center; color: #718096; padding: 40px;">Még nincsenek felhasználók.</p>';
            return;
        }

        this.usersContainer.innerHTML = this.users.map(user => this.createUserCard(user)).join('');
    }    createPostCard(post) {
        const createdDate = new Date(post.created_at).toLocaleDateString('hu-HU');
        const updatedDate = new Date(post.updated_at).toLocaleDateString('hu-HU');
        const wasModified = post.created_at !== post.updated_at;
        
        // Check if content is long (more than 200 characters)
        const isLongContent = post.content.length > 200;
        const truncatedContent = isLongContent ? post.content.substring(0, 200) + '...' : post.content;

        return `
            <div class="post-card">
                <div class="post-header">
                    <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                    <div class="post-meta">
                        <span class="post-author">👤 ${this.escapeHtml(post.author_name)}</span>
                        <span class="post-category">${this.escapeHtml(post.category)}</span>
                    </div>
                </div>
                
                <div class="post-content">
                    <div class="content-preview" id="content-preview-${post.id}">${this.escapeHtml(truncatedContent)}</div>
                    <div class="content-full" id="content-full-${post.id}" style="display: none;">${this.escapeHtml(post.content)}</div>
                    ${isLongContent ? `
                        <button class="btn btn-read-more" onclick="blogManager.toggleContent(${post.id})" id="toggle-btn-${post.id}">
                            📖 Teljes tartalom
                        </button>
                    ` : ''}
                </div>
                
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

    createUserCard(user) {
        const createdDate = new Date(user.created_at).toLocaleDateString('hu-HU');

        return `
            <div class="user-card">
                <div class="user-name">👤 ${this.escapeHtml(user.name)}</div>
                <div class="user-email">📧 ${this.escapeHtml(user.email)}</div>
                <div class="user-date">📅 Regisztrált: ${createdDate}</div>
            </div>
        `;
    }    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggleContent(postId) {
        const preview = document.getElementById(`content-preview-${postId}`);
        const full = document.getElementById(`content-full-${postId}`);
        const button = document.getElementById(`toggle-btn-${postId}`);
        
        if (full.style.display === 'none') {
            // Show full content
            preview.style.display = 'none';
            full.style.display = 'block';
            button.textContent = '📕 Kevesebb';
        } else {
            // Show preview
            preview.style.display = 'block';
            full.style.display = 'none';
            button.textContent = '📖 Teljes tartalom';
        }
    }

    async handlePostSubmit(e) {
        e.preventDefault();

        const formData = {
            user_id: parseInt(this.authorSelect.value),
            title: this.titleInput.value.trim(),
            category: this.categorySelect.value,
            content: this.contentTextarea.value.trim()
        };

        if (!this.validatePostForm(formData)) {
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
            }            this.showSuccess(this.currentEditId ? 'Blogbejegyzés sikeresen frissítve!' : 'Blogbejegyzés sikeresen létrehozva!');
            this.resetPostForm();
            await this.loadPosts();
            
            // Switch to view tab after successful creation/update
            if (!this.currentEditId) {
                showTab('view');
            }

        } catch (error) {
            this.showError('Hiba a blogbejegyzés mentése közben');
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = this.currentEditId ? 'Frissítés' : 'Létrehozás';
        }
    }

    async handleUserSubmit(e) {
        e.preventDefault();

        const formData = {
            name: this.userNameInput.value.trim(),
            email: this.userEmailInput.value.trim()
        };

        if (!this.validateUserForm(formData)) {
            return;
        }

        try {
            this.userSubmitBtn.disabled = true;
            this.userSubmitBtn.textContent = 'Mentés...';

            const response = await fetch(`${this.baseURL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create user');
            }

            this.showSuccess('Felhasználó sikeresen létrehozva!');
            this.resetUserForm();
            await this.loadUsers();

        } catch (error) {
            this.showError(error.message || 'Hiba a felhasználó létrehozása közben');
        } finally {
            this.userSubmitBtn.disabled = false;
            this.userSubmitBtn.textContent = 'Felhasználó Létrehozása';
        }
    }

    applyFilters() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        const selectedCategory = this.categoryFilter.value;
        const selectedAuthor = this.authorFilter.value;

        this.filteredPosts = this.posts.filter(post => {
            // Search filter
            const matchesSearch = searchTerm === '' || 
                post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm) ||
                post.author_name.toLowerCase().includes(searchTerm);

            // Category filter
            const matchesCategory = selectedCategory === '' || 
                post.category === selectedCategory;

            // Author filter
            const matchesAuthor = selectedAuthor === '' || 
                post.user_id.toString() === selectedAuthor;

            return matchesSearch && matchesCategory && matchesAuthor;
        });

        this.renderPosts();
    }

    validatePostForm(formData) {
        if (!formData.user_id) {
            this.showError('A szerző kiválasztása kötelező!');
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
    }

    validateUserForm(formData) {
        if (!formData.name) {
            this.showError('A név megadása kötelező!');
            return false;
        }
        if (!formData.email) {
            this.showError('Az email cím megadása kötelező!');
            return false;
        }
        if (!this.isValidEmail(formData.email)) {
            this.showError('Érvényes email címet adj meg!');
            return false;
        }
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }    async editPost(id) {
        try {
            const response = await fetch(`${this.baseURL}/posts/${id}`);
            if (!response.ok) throw new Error('Failed to load post');
            
            const post = await response.json();
            
            this.currentEditId = id;
            this.authorSelect.value = post.user_id;
            this.titleInput.value = post.title;
            this.categorySelect.value = post.category;
            this.contentTextarea.value = post.content;
            
            this.formTitle.textContent = 'Blogbejegyzés Szerkesztése';
            this.submitBtn.textContent = 'Frissítés';
            this.cancelBtn.style.display = 'inline-block';
              // Switch to posts tab and scroll to form
            showTab('posts');
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

            if (!response.ok) throw new Error('Failed to delete post');            this.showSuccess('Blogbejegyzés sikeresen törölve!');
            await this.loadPosts();
            
            // If we're editing the deleted post, reset the form
            if (this.currentEditId && this.currentEditId.toString() === id.toString()) {
                this.resetPostForm();
            }
        } catch (error) {
            this.showError('Hiba a blogbejegyzés törlése közben');
        } finally {
            this.closeModal();
        }
    }

    cancelEdit() {
        this.resetPostForm();
    }

    resetPostForm() {
        this.currentEditId = null;
        this.postForm.reset();
        this.formTitle.textContent = 'Új Blogbejegyzés Létrehozása';
        this.submitBtn.textContent = 'Létrehozás';
        this.cancelBtn.style.display = 'none';
    }

    resetUserForm() {
        this.userForm.reset();
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

        const activeTab = document.querySelector('.tab-content.active .form-section');
        if (activeTab) {
            activeTab.insertBefore(messageDiv, activeTab.firstChild);
        }

        // Auto-remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Find and activate the corresponding button
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => {
        if ((tabName === 'posts' && button.textContent.includes('Új Bejegyzés')) ||
            (tabName === 'view' && button.textContent.includes('Megtekintés')) ||
            (tabName === 'users' && button.textContent.includes('Felhasználók'))) {
            button.classList.add('active');
        }
    });
}

// Initialize the blog manager when the page loads
let blogManager;
document.addEventListener('DOMContentLoaded', () => {
    blogManager = new BlogManager();
});