// Verificar autenticação
function checkAuth() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
    }
}

// Executar verificação ao carregar
checkAuth();

// Dados gerais
const adminUsername = localStorage.getItem('adminUsername') || 'Admin';
document.getElementById('adminUsername').textContent = adminUsername;

// Base de dados (localStorage)
const DB = {
    getMovies() {
        return JSON.parse(localStorage.getItem('adminMovies')) || loadDefaultMovies();
    },
    setMovies(movies) {
        localStorage.setItem('adminMovies', JSON.stringify(movies));
    },
    getCategories() {
        return JSON.parse(localStorage.getItem('adminCategories')) || loadDefaultCategories();
    },
    setCategories(categories) {
        localStorage.setItem('adminCategories', JSON.stringify(categories));
    },
    getUsers() {
        return JSON.parse(localStorage.getItem('adminUsers')) || loadDefaultUsers();
    },
    setUsers(users) {
        localStorage.setItem('adminUsers', JSON.stringify(users));
    },
    getActivity() {
        return JSON.parse(localStorage.getItem('adminActivity')) || [];
    },
    addActivity(action) {
        const activity = this.getActivity();
        activity.unshift({
            action,
            timestamp: new Date().toLocaleString('pt-BR')
        });
        if (activity.length > 20) activity.pop();
        localStorage.setItem('adminActivity', JSON.stringify(activity));
    }
};

// Dados padrão
function loadDefaultMovies() {
    const movies = [
        {
            id: 1,
            title: "Stranger Things",
            image: "https://via.placeholder.com/400x600?text=Stranger+Things",
            year: 2016,
            rating: 8.7,
            genre: "Ficção Científica, Drama",
            duration: "50 min/época",
            description: "Quando um garoto desaparece, seus amigos, família e polícia local devem lidar com forças desconhecidas."
        },
        {
            id: 2,
            title: "Breaking Bad",
            image: "https://via.placeholder.com/400x600?text=Breaking+Bad",
            year: 2008,
            rating: 9.5,
            genre: "Crime, Drama",
            duration: "47 min/época",
            description: "Um professor de química transformado em criminoso usa seu conhecimento para criar droga."
        }
    ];
    DB.setMovies(movies);
    return movies;
}

function loadDefaultCategories() {
    const categories = [
        { id: 1, name: "Em Alta", color: "#e50914" },
        { id: 2, name: "Originais", color: "#f5af19" },
        { id: 3, name: "Ação", color: "#ff6b6b" }
    ];
    DB.setCategories(categories);
    return categories;
}

function loadDefaultUsers() {
    const users = [
        { id: 1, name: "Admin", email: "admin@netflix.com", role: "admin", created: new Date().toLocaleDateString('pt-BR') }
    ];
    DB.setUsers(users);
    return users;
}

// Navegação e seções
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = item.dataset.section;
        switchSection(sectionId);
    });
});

function switchSection(sectionId) {
    sections.forEach(s => s.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

    if (sectionId === 'movies') renderMoviesTable();
    if (sectionId === 'categories') renderCategories();
    if (sectionId === 'users') renderUsersTable();
    if (sectionId === 'dashboard') updateDashboard();
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        window.location.href = 'admin-login.html';
    }
});

// Update DateTime
function updateDateTime() {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('dateTime').textContent = new Date().toLocaleDateString('pt-BR', options);
}
updateDateTime();
setInterval(updateDateTime, 60000);

// ===== DASHBOARD =====
function updateDashboard() {
    const movies = DB.getMovies();
    const categories = DB.getCategories();
    const users = DB.getUsers();

    document.getElementById('statMovies').textContent = movies.length;
    document.getElementById('statCategories').textContent = categories.length;
    document.getElementById('statUsers').textContent = users.length;
    document.getElementById('statViews').textContent = Math.floor(Math.random() * 10000);

    const activity = DB.getActivity();
    const activityList = document.getElementById('recentActivity');
    activityList.innerHTML = activity.length > 0
        ? activity.map(a => `<p>📝 ${a.action}<br><small>${a.timestamp}</small></p>`).join('')
        : '<p class="empty-state">Nenhuma atividade registrada</p>';
}

// ===== MOVIES =====
let editingMovieId = null;
let currentImageBase64 = null;
let currentVideoBase64 = null;
let currentVideoType = 'local'; // 'local' ou 'url'
let currentVideoUrl = null;

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');
        
        // Limpar dados do tipo diferente ao mudar de aba
        if (tabName === 'video-upload') {
            currentVideoUrl = null;
            currentVideoType = 'local';
            document.getElementById('movieVideoUrl').value = '';
        } else if (tabName === 'video-url') {
            currentVideoBase64 = null;
            currentVideoType = 'url';
            document.getElementById('movieVideoFile').value = '';
        }
    });
});

// Image Upload Functions
function setupImageUpload() {
    const uploadZone = document.getElementById('imageUploadZone');
    const fileInput = document.getElementById('movieImageFile');

    // Click to select
    uploadZone.addEventListener('click', () => fileInput.click());

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) handleImageSelect(files[0]);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleImageSelect(e.target.files[0]);
    });
}

function handleImageSelect(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem!');
        return;
    }

    if (file.size > maxSize) {
        alert('Imagem muito grande! Máximo 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageBase64 = e.target.result;
        displayImagePreview(currentImageBase64);
    };
    reader.readAsDataURL(file);
}

function displayImagePreview(imageData) {
    const uploadZone = document.getElementById('imageUploadZone');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const preview = document.getElementById('imagePreview');

    uploadZone.style.display = 'none';
    previewContainer.style.display = 'block';
    preview.src = imageData;
}

function clearImage() {
    currentImageBase64 = null;
    document.getElementById('movieImageFile').value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imageUploadZone').style.display = 'block';
}

// Video Upload Functions
function setupVideoUpload() {
    const uploadZone = document.getElementById('videoUploadZone');
    const fileInput = document.getElementById('movieVideoFile');

    if (!uploadZone || !fileInput) return;

    // Click to select
    uploadZone.addEventListener('click', () => fileInput.click());

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) handleVideoSelect(files[0]);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleVideoSelect(e.target.files[0]);
    });

    // URL input
    const urlInput = document.getElementById('movieVideoUrl');
    if (urlInput) {
        urlInput.addEventListener('input', (e) => {
            if (e.target.value.trim()) {
                currentVideoType = 'url';
                currentVideoUrl = e.target.value.trim();
                displayVideoUrlInfo(currentVideoUrl);
            } else {
                currentVideoUrl = null;
            }
        });
    }
}

function handleVideoSelect(file) {
    const maxSize = 500 * 1024 * 1024; // 500MB

    if (!file.type.startsWith('video/')) {
        alert('Por favor, selecione um arquivo de vídeo!');
        return;
    }

    if (file.size > maxSize) {
        alert('Vídeo muito grande! Máximo 500MB');
        return;
    }

    const reader = new FileReader();
    
    reader.onprogress = (event) => {
        if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            updateUploadProgress(percentComplete);
        }
    };

    reader.onload = (e) => {
        currentVideoBase64 = e.target.result;
        currentVideoType = 'local';
        displayVideoPreview(file);
        document.getElementById('videoUploadProgress').style.display = 'none';
        document.getElementById('movieVideoUrl').value = '';
    };

    reader.onerror = () => {
        alert('Erro ao ler o arquivo de vídeo!');
    };

    document.getElementById('videoUploadProgress').style.display = 'block';
    reader.readAsDataURL(file);
}

function updateUploadProgress(percent) {
    document.getElementById('uploadProgressBar').style.width = percent + '%';
    document.getElementById('uploadProgressText').textContent = `Upload: ${percent}%`;
}

function displayVideoPreview(file) {
    const uploadZone = document.getElementById('videoUploadZone');
    const previewContainer = document.getElementById('videoPreviewContainer');
    const preview = document.getElementById('videoPreview');
    const videoInfo = document.getElementById('videoInfo');

    uploadZone.style.display = 'none';
    previewContainer.style.display = 'block';
    preview.src = currentVideoBase64;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const duration = 'Duração será calculada na reprodução';
    videoInfo.textContent = `Arquivo: ${file.name} | Tamanho: ${sizeMB}MB`;
}

function displayVideoUrlInfo(url) {
    const uploadZone = document.getElementById('videoUploadZone');
    const previewContainer = document.getElementById('videoPreviewContainer');
    const preview = document.getElementById('videoPreview');
    const videoInfo = document.getElementById('videoInfo');

    uploadZone.style.display = 'none';
    previewContainer.style.display = 'block';
    preview.src = url;

    const isMaster = url.includes('.m3u8');
    videoInfo.textContent = `${isMaster ? '🔴 Stream HLS (M3U8)' : '📹 Vídeo Direto'} | URL: ${url.substring(0, 50)}...`;
}

function clearVideo() {
    currentVideoBase64 = null;
    currentVideoType = 'local';
    currentVideoUrl = null;
    document.getElementById('movieVideoFile').value = '';
    document.getElementById('movieVideoUrl').value = '';
    document.getElementById('videoPreviewContainer').style.display = 'none';
    document.getElementById('videoUploadZone').style.display = 'block';
    document.getElementById('videoUploadProgress').style.display = 'none';
}

document.getElementById('addMovieBtn').addEventListener('click', () => {
    editingMovieId = null;
    currentImageBase64 = null;
    currentVideoBase64 = null;
    currentVideoType = 'local';
    currentVideoUrl = null;
    document.getElementById('movieForm').reset();
    clearImage();
    clearVideo();
    document.querySelector('#movieModal h2').textContent = 'Novo Filme';
    openModal('movieModal');
    setTimeout(() => {
        setupImageUpload();
        setupVideoUpload();
    }, 100);
});

document.getElementById('movieForm').addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currentImageBase64 && !editingMovieId) {
        alert('Por favor, selecione uma imagem para o filme!');
        return;
    }

    // Validar vídeo apenas para novos filmes
    if (!editingMovieId) {
        if (!currentVideoBase64 && !currentVideoUrl) {
            alert('Por favor, selecione um vídeo ou URL M3U8!');
            return;
        }
    }

    // Determinar qual tipo de vídeo usar
    let videoData = null;
    let videoType = 'local';
    
    if (currentVideoType === 'url' && currentVideoUrl) {
        videoData = currentVideoUrl;
        videoType = 'url';
    } else if (currentVideoBase64) {
        videoData = currentVideoBase64;
        videoType = 'local';
    } else if (editingMovieId) {
        // Se editando e não tem novo vídeo, usar o anterior
        const movies = DB.getMovies();
        const oldMovie = movies.find(m => m.id === editingMovieId);
        if (oldMovie) {
            videoData = oldMovie.video;
            videoType = oldMovie.videoType || 'local';
        }
    }

    const movie = {
        id: editingMovieId || Date.now(),
        title: document.getElementById('movieTitle').value.trim(),
        year: parseInt(document.getElementById('movieYear').value),
        rating: parseFloat(document.getElementById('movieRating').value),
        genre: document.getElementById('movieGenre').value.trim(),
        duration: document.getElementById('movieDuration').value.trim(),
        description: document.getElementById('movieDescription').value.trim(),
        image: currentImageBase64 || (editingMovieId ? (DB.getMovies().find(m => m.id === editingMovieId)?.image || '') : ''),
        video: videoData,
        videoType: videoType
    };

    if (!movie.title) {
        alert('Por favor, preencha o título do filme!');
        return;
    }

    const movies = DB.getMovies();
    if (editingMovieId) {
        const index = movies.findIndex(m => m.id === editingMovieId);
        if (index > -1) {
            movies[index] = movie;
            DB.addActivity(`Atualizou o filme "${movie.title}"`);
        }
    } else {
        movies.push(movie);
        DB.addActivity(`Adicionou o filme "${movie.title}"`);
    }

    DB.setMovies(movies);
    closeModal('movieModal');
    renderMoviesTable();
    updateDashboard();
    
    // Notificar todos os usuários sobre novo filme
    const notification = {
        type: 'new_movie',
        movieTitle: movie.title,
        timestamp: new Date().toISOString(),
        movieId: movie.id
    };
    localStorage.setItem('movieNotification', JSON.stringify(notification));
    
    alert('Filme salvo com sucesso! Atualizando para todos os usuários...');
});

function renderMoviesTable() {
    const movies = DB.getMovies();
    const tbody = document.getElementById('moviesTableBody');

    tbody.innerHTML = movies.map(movie => `
        <tr>
            <td><img src="${movie.image}" alt="${movie.title}" class="movie-img" onerror="this.src='https://via.placeholder.com/40x60?text=No+Image'"></td>
            <td>${movie.title}</td>
            <td>${movie.year}</td>
            <td>${movie.rating}/10</td>
            <td>${movie.genre}</td>
            <td>
                <div class="action-icons">
                    <button class="action-btn" title="Editar" onclick="editMovie(${movie.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" title="Deletar" onclick="deleteMovie(${movie.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function editMovie(id) {
    const movies = DB.getMovies();
    const movie = movies.find(m => m.id === id);

    if (movie) {
        editingMovieId = id;
        currentImageBase64 = movie.image;
        currentVideoType = movie.videoType || 'local';
        
        document.getElementById('movieTitle').value = movie.title;
        document.getElementById('movieYear').value = movie.year;
        document.getElementById('movieRating').value = movie.rating;
        document.getElementById('movieGenre').value = movie.genre;
        document.getElementById('movieDuration').value = movie.duration;
        document.getElementById('movieDescription').value = movie.description;

        // Mostrar preview da imagem se existir
        if (movie.image && movie.image.startsWith('data:')) {
            displayImagePreview(movie.image);
        } else {
            clearImage();
        }

        // Mostrar preview do vídeo se existir
        if (movie.video) {
            if (movie.videoType === 'url') {
                currentVideoUrl = movie.video;
                displayVideoUrlInfo(movie.video);
                // Mudar para aba URL
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                document.querySelector('[data-tab="video-url"]').classList.add('active');
                document.getElementById('video-url').classList.add('active');
                document.getElementById('movieVideoUrl').value = movie.video;
            } else {
                currentVideoBase64 = movie.video;
                const fileSize = (currentVideoBase64.length / 1024 / 1024).toFixed(2);
                const videoInfo = document.getElementById('videoInfo');
                const uploadZone = document.getElementById('videoUploadZone');
                const previewContainer = document.getElementById('videoPreviewContainer');
                const preview = document.getElementById('videoPreview');
                
                uploadZone.style.display = 'none';
                previewContainer.style.display = 'block';
                preview.src = currentVideoBase64;
                videoInfo.textContent = `Arquivo: vídeo carregado | Tamanho aproximado: ${fileSize}MB`;
            }
        } else {
            clearVideo();
        }

        document.querySelector('#movieModal h2').textContent = 'Editar Filme';
        openModal('movieModal');
        setTimeout(() => {
            setupImageUpload();
            setupVideoUpload();
        }, 100);
    }
}

function deleteMovie(id) {
    const movies = DB.getMovies();
    const movie = movies.find(m => m.id === id);

    if (confirm(`Tem certeza que deseja deletar "${movie.title}"?`)) {
        DB.setMovies(movies.filter(m => m.id !== id));
        DB.addActivity(`Deletou o filme "${movie.title}"`);
        renderMoviesTable();
        updateDashboard();
    }
}

// ===== CATEGORIES =====
let editingCategoryId = null;

document.getElementById('addCategoryBtn').addEventListener('click', () => {
    editingCategoryId = null;
    document.getElementById('categoryForm').reset();
    document.querySelector('#categoryModal h2').textContent = 'Nova Categoria';
    openModal('categoryModal');
});

document.getElementById('categoryForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const category = {
        id: editingCategoryId || Date.now(),
        name: document.getElementById('categoryName').value,
        color: document.getElementById('categoryColor').value
    };

    const categories = DB.getCategories();
    if (editingCategoryId) {
        const index = categories.findIndex(c => c.id === editingCategoryId);
        categories[index] = category;
        DB.addActivity(`Atualizou a categoria "${category.name}"`);
    } else {
        categories.push(category);
        DB.addActivity(`Adicionou a categoria "${category.name}"`);
    }

    DB.setCategories(categories);
    closeModal('categoryModal');
    renderCategories();
    updateDashboard();
});

function renderCategories() {
    const categories = DB.getCategories();
    const grid = document.getElementById('categoriesGrid');

    grid.innerHTML = categories.map(cat => `
        <div class="category-item">
            <div class="category-color" style="background-color: ${cat.color}"></div>
            <h4>${cat.name}</h4>
            <div class="category-actions">
                <button class="btn btn-secondary" onclick="editCategory(${cat.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteCategory(${cat.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function editCategory(id) {
    const categories = DB.getCategories();
    const category = categories.find(c => c.id === id);

    if (category) {
        editingCategoryId = id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryColor').value = category.color;

        document.querySelector('#categoryModal h2').textContent = 'Editar Categoria';
        openModal('categoryModal');
    }
}

function deleteCategory(id) {
    const categories = DB.getCategories();
    const category = categories.find(c => c.id === id);

    if (confirm(`Tem certeza que deseja deletar "${category.name}"?`)) {
        DB.setCategories(categories.filter(c => c.id !== id));
        DB.addActivity(`Deletou a categoria "${category.name}"`);
        renderCategories();
        updateDashboard();
    }
}

// ===== USERS =====
let editingUserId = null;

document.getElementById('addUserBtn').addEventListener('click', () => {
    editingUserId = null;
    document.getElementById('userForm').reset();
    document.querySelector('#userModal h2').textContent = 'Novo Usuário';
    openModal('userModal');
});

document.getElementById('userForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const user = {
        id: editingUserId || Date.now(),
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        created: new Date().toLocaleDateString('pt-BR'),
        status: 'Ativo'
    };

    const users = DB.getUsers();
    if (editingUserId) {
        const index = users.findIndex(u => u.id === editingUserId);
        users[index] = user;
        DB.addActivity(`Atualizou o usuário "${user.name}"`);
    } else {
        users.push(user);
        DB.addActivity(`Adicionou o usuário "${user.name}"`);
    }

    DB.setUsers(users);
    closeModal('userModal');
    renderUsersTable();
    updateDashboard();
});

function renderUsersTable() {
    const users = DB.getUsers();
    const tbody = document.getElementById('usersTableBody');

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>#${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.created}</td>
            <td><span style="color: #51cf66; font-weight: bold;">${user.status}</span></td>
            <td>
                <div class="action-icons">
                    <button class="action-btn" title="Editar" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" title="Deletar" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function editUser(id) {
    const users = DB.getUsers();
    const user = users.find(u => u.id === id);

    if (user) {
        editingUserId = id;
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userRole').value = user.role;

        document.querySelector('#userModal h2').textContent = 'Editar Usuário';
        openModal('userModal');
    }
}

function deleteUser(id) {
    const users = DB.getUsers();
    const user = users.find(u => u.id === id);

    if (user.id === 1) {
        alert('Você não pode deletar o usuário administrador principal!');
        return;
    }

    if (confirm(`Tem certeza que deseja deletar "${user.name}"?`)) {
        DB.setUsers(users.filter(u => u.id !== id));
        DB.addActivity(`Deletou o usuário "${user.name}"`);
        renderUsersTable();
        updateDashboard();
    }
}

// ===== SETTINGS =====
document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const settings = {
        siteName: document.getElementById('siteName').value,
        siteDescription: document.getElementById('siteDescription').value,
        itemsPerPage: document.getElementById('itemsPerPage').value
    };

    localStorage.setItem('siteSettings', JSON.stringify(settings));
    DB.addActivity('Atualizou as configurações do site');
    alert('Configurações salvas com sucesso!');
});

document.getElementById('exportBtn').addEventListener('click', () => {
    const data = {
        movies: DB.getMovies(),
        categories: DB.getCategories(),
        users: DB.getUsers(),
        settings: JSON.parse(localStorage.getItem('siteSettings')) || {},
        exportDate: new Date().toLocaleString('pt-BR')
    };

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
    element.setAttribute('download', `netflix-backup-${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    DB.addActivity('Exportou os dados');
});

document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                DB.setMovies(data.movies || []);
                DB.setCategories(data.categories || []);
                DB.setUsers(data.users || []);
                if (data.settings) localStorage.setItem('siteSettings', JSON.stringify(data.settings));
                DB.addActivity('Importou dados de um backup');
                alert('Dados importados com sucesso!');
                location.reload();
            } catch (error) {
                alert('Erro ao importar arquivo. Verifique o formato JSON.');
            }
        };
        reader.readAsText(file);
    }
});

document.getElementById('clearAllBtn').addEventListener('click', () => {
    if (confirm('⚠️ ATENÇÃO! Isto irá deletar TODOS os dados. Esta ação é IRREVERSÍVEL. Tem certeza?')) {
        if (confirm('Digite "DELETAR" mentalmente - esta é sua última chance!')) {
            localStorage.removeItem('adminMovies');
            localStorage.removeItem('adminCategories');
            localStorage.removeItem('adminUsers');
            localStorage.removeItem('adminActivity');
            alert('Todos os dados foram deletados.');
            location.reload();
        }
    }
});

// ===== MODAL FUNCTIONS =====
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.remove('active');
    });
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    setupImageUpload();
});
