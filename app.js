/**
 * BEUShareBox - Advanced Feature-Rich Application
 * Modern SaaS-style product sharing platform
 * FIXED: Search functionality now working
 */

// ==================== STATE MANAGEMENT ====================
class Store {
    constructor() {
        this.products = [];
        this.user = {
            name: 'Guest User',
            avatar: null,
            theme: 'light'
        };
        this.filters = {
            search: '',
            category: 'all',
            sort: 'newest',
            showMyProducts: false
        };
        this.listeners = [];
    }

    // Initialize store with data from localStorage
    init() {
        this.loadFromStorage();
        this.applyTheme();
        console.log('Store initialized with', this.products.length, 'products');
    }

    // Subscribe to state changes
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // Notify all listeners of state change
    notify() {
        console.log('State changed, notifying listeners');
        this.listeners.forEach(listener => listener());
        this.saveToStorage();
    }

    // Load all data from localStorage
    loadFromStorage() {
        try {
            const savedProducts = localStorage.getItem('beusharebox_products');
            this.products = savedProducts ? JSON.parse(savedProducts) : this.getSampleProducts();
            
            // Ensure all products have the createdBy field and other required fields
            this.products = this.products.map(product => ({
                id: product.id || this.generateId(),
                title: product.title || 'Untitled',
                description: product.description || '',
                price: product.price || 0,
                category: product.category || 'Other',
                image: product.image || null,
                likes: product.likes || 0,
                comments: product.comments || [],
                createdAt: product.createdAt || new Date().toISOString(),
                createdBy: product.createdBy || 'Guest User'
            }));

            const savedUser = localStorage.getItem('beusharebox_user');
            if (savedUser) {
                this.user = JSON.parse(savedUser);
            }

            const savedFilters = localStorage.getItem('beusharebox_filters');
            if (savedFilters) {
                this.filters = { ...this.filters, ...JSON.parse(savedFilters) };
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.products = this.getSampleProducts();
        }
    }

    // Save all data to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('beusharebox_products', JSON.stringify(this.products));
            localStorage.setItem('beusharebox_user', JSON.stringify(this.user));
            localStorage.setItem('beusharebox_filters', JSON.stringify(this.filters));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            if (typeof Toast !== 'undefined') {
                Toast.show('Failed to save data', 'error');
            }
        }
    }

    // Get sample products for initial state
    getSampleProducts() {
        return [
            {
                id: this.generateId(),
                title: 'Premium Wireless Headphones',
                description: 'High-quality noise-cancelling headphones with 30h battery life',
                price: 199.99,
                category: 'Electronics',
                image: null,
                likes: 15,
                comments: ['Amazing sound quality!', 'Very comfortable'],
                createdAt: new Date().toISOString(),
                createdBy: 'Guest User'
            },
            {
                id: this.generateId(),
                title: 'Designer Cotton T-Shirt',
                description: '100% organic cotton, perfect fit for everyday wear',
                price: 29.99,
                category: 'Clothing',
                image: null,
                likes: 8,
                comments: ['Love the fabric', 'True to size'],
                createdAt: new Date().toISOString(),
                createdBy: 'Guest User'
            },
            {
                id: this.generateId(),
                title: 'Smart Watch Pro',
                description: 'Track your fitness and stay connected with this advanced smart watch',
                price: 249.99,
                category: 'Electronics',
                image: null,
                likes: 12,
                comments: ['Great battery life', 'Love the design'],
                createdAt: new Date().toISOString(),
                createdBy: 'Guest User'
            },
            {
                id: this.generateId(),
                title: 'Leather Wallet',
                description: 'Genuine leather wallet with multiple card slots',
                price: 39.99,
                category: 'Clothing',
                image: null,
                likes: 5,
                comments: ['Looks elegant', 'Good quality'],
                createdAt: new Date().toISOString(),
                createdBy: 'Guest User'
            },
            {
                id: this.generateId(),
                title: 'Running Shoes',
                description: 'Lightweight running shoes with superior cushioning',
                price: 89.99,
                category: 'Sports',
                image: null,
                likes: 7,
                comments: ['Very comfortable', 'Great for running'],
                createdAt: new Date().toISOString(),
                createdBy: 'Guest User'
            }
        ];
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // Apply theme based on user preference
    applyTheme() {
        document.body.setAttribute('data-theme', this.user.theme);
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.user.theme === 'light' ? '🌞' : '🌚';
        }
    }

    // Toggle theme
    toggleTheme() {
        this.user.theme = this.user.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.notify();
        if (typeof Toast !== 'undefined') {
            Toast.show(`${this.user.theme === 'light' ? '☀️' : '🌙'} Theme changed`, 'info');
        }
    }

    // Get filtered and sorted products
    getFilteredProducts() {
        console.log('Filtering products. Total:', this.products.length);
        console.log('Current filters:', this.filters);
        
        let filtered = [...this.products];

        // Filter by search - FIXED: Proper search implementation
        if (this.filters.search && this.filters.search.trim() !== '') {
            const searchTerm = this.filters.search.toLowerCase().trim();
            console.log('Searching for:', searchTerm);
            
            filtered = filtered.filter(p => {
                const titleMatch = p.title && p.title.toLowerCase().includes(searchTerm);
                const descMatch = p.description && p.description.toLowerCase().includes(searchTerm);
                return titleMatch || descMatch;
            });
            
            console.log('Products after search:', filtered.length);
        }

        // Filter by category
        if (this.filters.category && this.filters.category !== 'all') {
            filtered = filtered.filter(p => p.category === this.filters.category);
            console.log('After category filter:', filtered.length);
        }

        // Filter by user's products
        if (this.filters.showMyProducts) {
            filtered = filtered.filter(p => p.createdBy === this.user.name);
            console.log('After my products filter:', filtered.length);
        }

        // Sort products
        switch (this.filters.sort) {
            case 'price-low':
                filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-high':
                filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'most-liked':
                filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        console.log('Final filtered products:', filtered.length);
        return filtered;
    }

    // Add new product
    addProduct(productData) {
        const newProduct = {
            id: this.generateId(),
            ...productData,
            likes: 0,
            comments: [],
            createdAt: new Date().toISOString(),
            createdBy: this.user.name
        };

        this.products.unshift(newProduct);
        console.log('Product added. Total products:', this.products.length);
        this.notify();
        if (typeof Toast !== 'undefined') {
            Toast.show('✅ Product added successfully!', 'success');
        }
        return newProduct;
    }

    // Update product
    updateProduct(productId, updates) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updates };
            this.notify();
        }
    }

    // Delete product
    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.notify();
            if (typeof Toast !== 'undefined') {
                Toast.show('🗑️ Product deleted', 'info');
            }
        }
    }

    // Like product
    likeProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            product.likes = (product.likes || 0) + 1;
            this.notify();
            if (typeof Toast !== 'undefined') {
                Toast.show('❤️ Product liked!', 'success');
            }
        }
    }

    // Add comment
    addComment(productId, comment) {
        const product = this.products.find(p => p.id === productId);
        if (product && comment.trim()) {
            if (!product.comments) {
                product.comments = [];
            }
            product.comments.push(comment.trim());
            this.notify();
            if (typeof Toast !== 'undefined') {
                Toast.show('💬 Comment added', 'success');
            }
        }
    }

    // Get statistics
    getStats() {
        const totalProducts = this.products.length;
        const totalLikes = this.products.reduce((sum, p) => sum + (p.likes || 0), 0);
        
        const mostLiked = this.products.reduce((most, p) => 
            !most || (p.likes || 0) > (most.likes || 0) ? p : most, null);
        
        const categoryDistribution = this.products.reduce((dist, p) => {
            const category = p.category || 'Other';
            dist[category] = (dist[category] || 0) + 1;
            return dist;
        }, {});

        const userProducts = this.products.filter(p => p.createdBy === this.user.name).length;

        return {
            totalProducts,
            totalLikes,
            mostLiked,
            categoryDistribution,
            userProducts
        };
    }

    // Export data as JSON
    exportData() {
        const data = {
            products: this.products,
            user: this.user,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beusharebox-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        if (typeof Toast !== 'undefined') {
            Toast.show('📥 Data exported successfully', 'success');
        }
    }

    // Import data from JSON
    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.products && Array.isArray(data.products)) {
                // Ensure imported products have required fields
                const processedProducts = data.products.map(product => ({
                    id: product.id || this.generateId(),
                    title: product.title || 'Untitled',
                    description: product.description || '',
                    price: product.price || 0,
                    category: product.category || 'Other',
                    image: product.image || null,
                    likes: product.likes || 0,
                    comments: product.comments || [],
                    createdAt: product.createdAt || new Date().toISOString(),
                    createdBy: product.createdBy || 'Guest User'
                }));

                // Merge products (avoid duplicates by checking IDs)
                const existingIds = new Set(this.products.map(p => p.id));
                const newProducts = processedProducts.filter(p => !existingIds.has(p.id));
                this.products = [...this.products, ...newProducts];
                
                if (data.user) {
                    this.user = { ...this.user, ...data.user };
                }
                
                this.notify();
                if (typeof Toast !== 'undefined') {
                    Toast.show(`📤 Imported ${newProducts.length} new products`, 'success');
                }
            }
        } catch (error) {
            if (typeof Toast !== 'undefined') {
                Toast.show('Failed to import data', 'error');
            }
            console.error('Import error:', error);
        }
    }

    // Reorder products (for drag & drop)
    reorderProducts(sourceId, targetId) {
        const sourceIndex = this.products.findIndex(p => p.id === sourceId);
        const targetIndex = this.products.findIndex(p => p.id === targetId);
        
        if (sourceIndex !== -1 && targetIndex !== -1) {
            const [removed] = this.products.splice(sourceIndex, 1);
            this.products.splice(targetIndex, 0, removed);
            this.notify();
            if (typeof Toast !== 'undefined') {
                Toast.show('Products reordered', 'info');
            }
        }
    }

    // Clear all filters
    clearFilters() {
        this.filters = {
            search: '',
            category: 'all',
            sort: 'newest',
            showMyProducts: false
        };
        this.notify();
        if (typeof Toast !== 'undefined') {
            Toast.show('Filters cleared', 'info');
        }
    }
}

// ==================== TOAST NOTIFICATION SYSTEM ====================
class Toast {
    static container = null;

    static init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    static show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s reverse';
            setTimeout(() => {
                if (this.container.contains(toast)) {
                    this.container.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
}

// ==================== UI RENDERER ====================
class UIRenderer {
    constructor(store) {
        this.store = store;
        this.currentModalProductId = null;
        this.draggedItem = null;
        this.searchTimeout = null; // For debouncing search
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        // DOM Elements
        this.productsContainer = document.getElementById('products-container');
        this.productForm = document.getElementById('product-form');
        this.searchInput = document.getElementById('search-input');
        this.categoryFilter = document.getElementById('category-filter');
        this.sortSelect = document.getElementById('sort-select');
        this.usernameInput = document.getElementById('username-input');
        this.avatarUpload = document.getElementById('avatar-upload');
        this.avatarPreview = document.getElementById('avatar-preview');
        this.themeToggle = document.getElementById('theme-toggle');
        this.menuToggle = document.getElementById('menu-toggle');
        this.closeSidebar = document.getElementById('close-sidebar');
        this.sidebar = document.getElementById('sidebar');
        this.exportBtn = document.getElementById('export-btn');
        this.importFile = document.getElementById('import-file');
        this.productImage = document.getElementById('product-image');
        this.imagePreview = document.getElementById('image-preview-container');
        
        // Modal elements
        this.modal = document.getElementById('product-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalImage = document.getElementById('modal-image');
        this.modalDescription = document.getElementById('modal-description');
        this.modalPrice = document.getElementById('modal-price');
        this.modalCategory = document.getElementById('modal-category');
        this.modalLikes = document.getElementById('modal-likes');
        this.modalCommentsCount = document.getElementById('modal-comments-count');
        this.modalCommentsList = document.getElementById('modal-comments-list');
        this.modalCommentInput = document.getElementById('modal-comment-input');
        this.modalAddComment = document.getElementById('modal-add-comment');
        this.closeModalBtn = document.querySelector('.close-modal');

        // Navigation buttons
        this.navButtons = document.querySelectorAll('.nav-btn');

        console.log('Elements initialized');
        console.log('Search input found:', this.searchInput);
    }

    initEventListeners() {
        // Form submission
        if (this.productForm) {
            this.productForm.addEventListener('submit', (e) => this.handleAddProduct(e));
        }

        // Search and filters - FIXED: Search event listener with debouncing
        if (this.searchInput) {
            // Use input event for real-time search
            this.searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value;
                console.log('Search input:', searchTerm);
                
                // Debounce search to avoid too many updates
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.store.filters.search = searchTerm;
                    this.store.notify();
                }, 300);
            });

            // Also handle keyup for immediate feedback
            this.searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    clearTimeout(this.searchTimeout);
                    this.store.filters.search = e.target.value;
                    this.store.notify();
                }
            });
        }

        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', (e) => {
                console.log('Category filter changed:', e.target.value);
                this.store.filters.category = e.target.value;
                this.store.notify();
            });
        }

        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                console.log('Sort changed:', e.target.value);
                this.store.filters.sort = e.target.value;
                this.store.notify();
            });
        }

        // User profile
        if (this.usernameInput) {
            this.usernameInput.addEventListener('change', (e) => {
                this.store.user.name = e.target.value;
                this.store.notify();
            });
        }

        if (this.avatarUpload) {
            this.avatarUpload.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }

        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.store.toggleTheme());
        }

        // Sidebar toggle
        if (this.menuToggle && this.sidebar) {
            this.menuToggle.addEventListener('click', () => {
                this.sidebar.classList.add('active');
            });
        }

        if (this.closeSidebar && this.sidebar) {
            this.closeSidebar.addEventListener('click', () => {
                this.sidebar.classList.remove('active');
            });
        }

        // Navigation
        if (this.navButtons) {
            this.navButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.navButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    if (btn.dataset.filter === 'my-products') {
                        this.store.filters.showMyProducts = true;
                    } else {
                        this.store.filters.showMyProducts = false;
                    }
                    
                    this.store.notify();
                    if (this.sidebar) this.sidebar.classList.remove('active');
                });
            });
        }

        // Export/Import
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.store.exportData());
        }
        
        if (this.importFile) {
            this.importFile.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.store.importData(e.target.files[0]);
                }
                // Reset input so same file can be selected again
                e.target.value = '';
            });
        }

        // Product image preview
        if (this.productImage) {
            this.productImage.addEventListener('change', (e) => this.handleImagePreview(e));
        }

        // Modal events
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeModal());
        }
        
        window.addEventListener('click', (e) => {
            if (this.modal && e.target === this.modal) this.closeModal();
        });
        
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });

        if (this.modalAddComment) {
            this.modalAddComment.addEventListener('click', () => this.handleModalAddComment());
        }

        // Subscribe to store changes
        this.store.subscribe(() => {
            console.log('Store changed, re-rendering...');
            this.render();
            this.updateStats();
        });
    }

    handleAddProduct(e) {
        e.preventDefault();

        const title = document.getElementById('title')?.value.trim();
        const description = document.getElementById('description')?.value.trim();
        const price = parseFloat(document.getElementById('price')?.value);
        const category = document.getElementById('category')?.value;

        if (!title || !description || !price || !category) {
            Toast.show('Please fill in all fields', 'error');
            return;
        }

        if (price < 0) {
            Toast.show('Price cannot be negative', 'error');
            return;
        }

        // Get image if uploaded
        let image = null;
        if (this.imagePreview) {
            const previewImg = this.imagePreview.querySelector('img');
            if (previewImg) {
                image = previewImg.src;
            }
        }

        this.store.addProduct({
            title,
            description,
            price,
            category,
            image
        });

        // Reset form
        this.productForm.reset();
        if (this.imagePreview) {
            this.imagePreview.innerHTML = '';
        }
    }

    handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.store.user.avatar = e.target.result;
                if (this.avatarPreview) {
                    this.avatarPreview.src = e.target.result;
                }
                this.store.saveToStorage();
                Toast.show('Profile picture updated', 'success');
            };
            reader.readAsDataURL(file);
        }
    }

    handleImagePreview(e) {
        const file = e.target.files[0];
        if (file && this.imagePreview) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100px; border-radius: 4px;">`;
            };
            reader.readAsDataURL(file);
        }
    }

    handleModalAddComment() {
        const comment = this.modalCommentInput?.value.trim();
        if (comment && this.currentModalProductId) {
            this.store.addComment(this.currentModalProductId, comment);
            if (this.modalCommentInput) {
                this.modalCommentInput.value = '';
            }
            this.updateModalComments();
        }
    }

    openModal(productId) {
        const product = this.store.products.find(p => p.id === productId);
        if (!product || !this.modal) return;

        this.currentModalProductId = productId;
        
        if (this.modalTitle) this.modalTitle.textContent = product.title || 'Untitled';
        if (this.modalImage) {
            this.modalImage.src = product.image || 'https://via.placeholder.com/400x200?text=No+Image';
        }
        if (this.modalDescription) this.modalDescription.textContent = product.description || '';
        if (this.modalPrice) this.modalPrice.textContent = `$${(product.price || 0).toFixed(2)}`;
        if (this.modalCategory) this.modalCategory.textContent = product.category || 'Other';
        if (this.modalLikes) this.modalLikes.textContent = product.likes || 0;
        if (this.modalCommentsCount) this.modalCommentsCount.textContent = (product.comments || []).length;
        
        this.updateModalComments();
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
            this.currentModalProductId = null;
        }
    }

    updateModalComments() {
        if (!this.modalCommentsList) return;
        
        const product = this.store.products.find(p => p.id === this.currentModalProductId);
        if (product) {
            const comments = product.comments || [];
            if (comments.length === 0) {
                this.modalCommentsList.innerHTML = '<p class="empty-state" style="padding: 1rem;">No comments yet</p>';
            } else {
                this.modalCommentsList.innerHTML = comments
                    .map(comment => `<div class="comment-item">💬 ${this.escapeHtml(comment)}</div>`)
                    .join('');
            }
        }
    }

    render() {
        console.log('Rendering products...');
        
        if (!this.productsContainer) {
            console.error('Products container not found!');
            return;
        }
        
        const filteredProducts = this.store.getFilteredProducts();
        console.log('Rendering', filteredProducts.length, 'products');
        
        if (filteredProducts.length === 0) {
            this.renderEmptyState();
        } else {
            this.renderProducts(filteredProducts);
        }
        
        // Update filter inputs to match current state
        if (this.searchInput) {
            // Don't update value if user is typing
            if (document.activeElement !== this.searchInput) {
                this.searchInput.value = this.store.filters.search || '';
            }
        }
        if (this.categoryFilter) {
            this.categoryFilter.value = this.store.filters.category || 'all';
        }
        if (this.sortSelect) {
            this.sortSelect.value = this.store.filters.sort || 'newest';
        }

        // Update navigation buttons
        if (this.navButtons) {
            this.navButtons.forEach(btn => {
                if (btn.dataset.filter === 'my-products' && this.store.filters.showMyProducts) {
                    btn.classList.add('active');
                } else if (btn.dataset.filter !== 'my-products' && !this.store.filters.showMyProducts) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }

    renderProducts(products) {
        this.productsContainer.innerHTML = products.map(product => {
            // Ensure all properties exist
            const title = product.title || 'Untitled';
            const description = product.description || '';
            const price = product.price || 0;
            const category = product.category || 'Other';
            const likes = product.likes || 0;
            const comments = product.comments || [];
            const image = product.image;
            const id = product.id;
            
            return `
                <article class="product-card" draggable="true" data-id="${id}">
                    ${image ? `<img src="${image}" alt="${this.escapeHtml(title)}" class="product-image">` : ''}
                    <div class="product-header">
                        <h3 class="product-title">${this.escapeHtml(title)}</h3>
                        <span class="product-category">${this.escapeHtml(category)}</span>
                    </div>
                    <p class="product-description">${this.escapeHtml(description.substring(0, 100))}${description.length > 100 ? '...' : ''}</p>
                    <div class="product-price">$${price.toFixed(2)}</div>
                    <div class="product-actions">
                        <button class="action-btn like-btn" data-action="like" data-id="${id}">
                            ❤️ <span class="like-count">${likes}</span>
                        </button>
                        <button class="action-btn comment-btn" data-action="comment" data-id="${id}">
                            💬 <span class="comment-count">${comments.length}</span>
                        </button>
                        <button class="action-btn delete-btn" data-action="delete" data-id="${id}">
                            🗑️
                        </button>
                    </div>
                </article>
            `;
        }).join('');

        // Add event listeners to product cards
        this.productsContainer.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.action-btn')) {
                    this.openModal(card.dataset.id);
                }
            });

            // Drag and drop events
            card.setAttribute('draggable', 'true');
            card.addEventListener('dragstart', (e) => this.handleDragStart(e));
            card.addEventListener('dragover', (e) => this.handleDragOver(e));
            card.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            card.addEventListener('drop', (e) => this.handleDrop(e));
            card.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        // Add event listeners to action buttons
        this.productsContainer.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const productId = btn.dataset.id;

                switch (action) {
                    case 'like':
                        this.store.likeProduct(productId);
                        break;
                    case 'comment':
                        this.openModal(productId);
                        break;
                    case 'delete':
                        this.store.deleteProduct(productId);
                        break;
                }
            });
        });
    }

    renderEmptyState() {
        const showClearFilters = this.store.filters.search || 
                                this.store.filters.category !== 'all' || 
                                this.store.filters.showMyProducts;
        
        this.productsContainer.innerHTML = `
            <div class="empty-state">
                <p>📦 No products found</p>
                <p class="hint">Add your first product using the form above!</p>
                ${showClearFilters ? 
                    '<button class="btn-primary" style="margin-top: 1rem; padding: 0.5rem 1rem;" onclick="window.clearFilters()">Clear Filters</button>' : 
                    ''}
            </div>
        `;
    }

    updateStats() {
        const stats = this.store.getStats();
        
        const userProductsEl = document.getElementById('user-products-count');
        const totalLikesEl = document.getElementById('total-likes-count');
        
        if (userProductsEl) userProductsEl.textContent = stats.userProducts;
        if (totalLikesEl) totalLikesEl.textContent = stats.totalLikes;
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Drag and Drop Implementation
    handleDragStart(e) {
        this.draggedItem = e.target.closest('.product-card');
        if (this.draggedItem) {
            this.draggedItem.classList.add('dragging');
            e.dataTransfer.setData('text/plain', this.draggedItem.dataset.id);
            e.dataTransfer.effectAllowed = 'move';
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const card = e.target.closest('.product-card');
        if (card && card !== this.draggedItem) {
            card.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const card = e.target.closest('.product-card');
        if (card) {
            card.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const targetCard = e.target.closest('.product-card');
        const sourceId = e.dataTransfer.getData('text/plain');
        
        if (targetCard && sourceId && sourceId !== targetCard.dataset.id) {
            this.store.reorderProducts(sourceId, targetCard.dataset.id);
        }
        
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('drag-over');
        });
    }

    handleDragEnd(e) {
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('dragging', 'drag-over');
        });
        this.draggedItem = null;
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    // Initialize Toast
    Toast.init();
    
    // Create store and renderer
    const store = new Store();
    store.init();
    
    const renderer = new UIRenderer(store);
    
    // Apply user data from store
    if (store.user.avatar && renderer.avatarPreview) {
        renderer.avatarPreview.src = store.user.avatar;
    }
    
    // Make clearFilters available globally
    window.clearFilters = () => {
        store.clearFilters();
    };
    
    // Initial render
    renderer.render();
    
    console.log('App initialized with', store.products.length, 'products');
});