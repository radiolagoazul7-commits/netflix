// Sistema de proteção de acesso
function checkAuthAccess() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!isLoggedIn || !currentUser) {
        // Redirecionar para login
        window.location.href = 'auth.html';
        return false;
    }

    // Mostrar nome do usuário
    displayUserInfo(currentUser);
    return true;
}

function displayUserInfo(user) {
    const userBtn = document.querySelector('.user-btn');
    if (userBtn) {
        userBtn.title = `${user.name} (${user.email})`;
        userBtn.innerHTML = `${user.avatar} <span style="margin-left: 5px; font-size: 12px;">${user.name.split(' ')[0]}</span>`;
    }
}

// Logout
function logout() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        logActivity(currentUser.id, 'logout', `${currentUser.name} fez logout`);
    }
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberLogin');
    window.location.href = 'auth.html';
}

function logActivity(userId, action, description) {
    const activities = JSON.parse(localStorage.getItem('appActivities')) || [];
    activities.push({
        userId,
        action,
        description,
        timestamp: new Date().toLocaleString('pt-BR')
    });
    if (activities.length > 100) activities.shift();
    localStorage.setItem('appActivities', JSON.stringify(activities));
}

// ===== SISTEMA DE SINCRONIZAÇÃO EM TEMPO REAL =====
let lastMoviesHash = null;

// Gerar hash dos filmes para detectar mudanças
function getMoviesHash() {
    return JSON.stringify(JSON.parse(localStorage.getItem('adminMovies')) || []);
}

// Sincronizar filmes quando detectar mudanças
function syncMoviesFromAdmin() {
    const currentHash = getMoviesHash();
    
    if (lastMoviesHash === null) {
        // Primeira execução
        lastMoviesHash = currentHash;
        return;
    }
    
    if (currentHash !== lastMoviesHash) {
        console.log('📡 Novos filmes detectados! Atualizando...');
        lastMoviesHash = currentHash;
        
        // Recarregar filmes e atualizar UI
        loadMoviesFromAdmin();
        recalculateCategories();
        renderCarousel(trendingMovies, "trendingCarousel");
        renderCarousel(originalMovies, "originalsCarousel");
        renderCarousel(actionMovies, "actionCarousel");
        renderCarousel(comedyMovies, "comedyCarousel");
        renderCarousel(dramaMovies, "dramaCarousel");
        
        // Mostrar notificação de atualização
        showUpdateNotification();
    }
}

// Mostrar notificação de novo conteúdo
function showUpdateNotification(movieTitle = null) {
    const notification = document.createElement('div');
    const message = movieTitle 
        ? `🎬 Novo filme: "${movieTitle}" foi adicionado!`
        : '🎬 Novo conteúdo adicionado! Atualizando...';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #e50914 0%, #c40812 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Adicionar estilos de animação
const syncStyle = document.createElement('style');
syncStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(syncStyle);

// Dados de exemplo de filmes e séries
let moviesData = [
    {
        id: 1,
        title: "Stranger Things",
        image: "https://via.placeholder.com/400x600?text=Stranger+Things",
        year: 2016,
        rating: 8.7,
        genre: "Ficção Científica, Drama",
        duration: "50 min/época",
        description: "Quando um garoto desaparece, seus amigos, família e polícia local devem lidar com forças desconhecidas e mistérios assustadores para descobrir a verdade."
    },
    {
        id: 2,
        title: "The Crown",
        image: "https://via.placeholder.com/400x600?text=The+Crown",
        year: 2016,
        rating: 8.6,
        genre: "Drama, História",
        duration: "60 min/época",
        description: "A história dramática dos bastidores do reinado de Elizabeth II e do trabalho de manter a estabilidade durante as turbulências da mudança social e política."
    },
    {
        id: 3,
        title: "Breaking Bad",
        image: "https://via.placeholder.com/400x600?text=Breaking+Bad",
        year: 2008,
        rating: 9.5,
        genre: "Crime, Drama",
        duration: "47 min/época",
        description: "Um professor de química transformado em criminoso usa seu conhecimento para criar uma droga muito pura enquanto tenta se encaixar no mundo criminoso."
    },
    {
        id: 4,
        title: "The Office",
        image: "https://via.placeholder.com/400x600?text=The+Office",
        year: 2005,
        rating: 9.0,
        genre: "Comédia, Drama",
        duration: "22 min/época",
        description: "Um documentário do dia a dia da filial de Scranton de uma empresa de papel, onde o gerente bem-intencionado lida com seus funcionários excêntricos."
    },
    {
        id: 5,
        title: "The Witcher",
        image: "https://via.placeholder.com/400x600?text=The+Witcher",
        year: 2019,
        rating: 8.0,
        genre: "Fantasia, Ação",
        duration: "60 min/época",
        description: "Geralt de Rivia, um caçador de monstros mutante, navega por um mundo vasto em que nem sempre está claro quem é o monstro e quem é o homem."
    },
    {
        id: 6,
        title: "Game of Thrones",
        image: "https://via.placeholder.com/400x600?text=Game+of+Thrones",
        year: 2011,
        rating: 9.2,
        genre: "Ação, Aventura, Drama",
        duration: "56 min/época",
        description: "Nove famílias nobres lutam pela controle de uma terra mítica, enquanto uma ameaça antiga retorna após um longo inverno."
    },
    {
        id: 7,
        title: "Narcos",
        image: "https://via.placeholder.com/400x600?text=Narcos",
        year: 2015,
        rating: 8.8,
        genre: "Crime, Drama",
        duration: "50 min/época",
        description: "Um agente da DEA lidera uma perseguição para prender o notório traficante de drogas Pablo Escobar, controlando a maior rede de distribuição de cocaína."
    },
    {
        id: 8,
        title: "The Mandalorian",
        image: "https://via.placeholder.com/400x600?text=The+Mandalorian",
        year: 2019,
        rating: 8.7,
        genre: "Ficção Científica, Ação",
        duration: "39 min/época",
        description: "O Mandaloriano viaja pelo pós-apocalíptico mundo Star Wars, aceita trabalhos e encontra uma criança misteriosa que acarreta muita atenção de forças poderosas."
    },
    {
        id: 9,
        title: "Peaky Blinders",
        image: "https://via.placeholder.com/400x600?text=Peaky+Blinders",
        year: 2013,
        rating: 8.8,
        genre: "Crime, Drama",
        duration: "59 min/época",
        description: "Uma gangue de rua de Birmingham se torna uma operação muito mais vasta no Reino Unido após a Primeira Guerra Mundial."
    },
    {
        id: 10,
        title: "The Mandalorian 2",
        image: "https://via.placeholder.com/400x600?text=Mandalorian+2",
        year: 2020,
        rating: 8.5,
        genre: "Ficção Científica, Ação",
        duration: "39 min/época",
        description: "Continuação da saga do Mandaloriano e Grogu em busca de seu destino e proteção contra as forças escuras da galáxia."
    },
    {
        id: 11,
        title: "Mad Men",
        image: "https://via.placeholder.com/400x600?text=Mad+Men",
        year: 2007,
        rating: 8.5,
        genre: "Drama",
        duration: "47 min/época",
        description: "Um drama que se passa na Madison Avenue durante os anos 1960, seguindo a vida profissional e pessoal de executivos de publicidade."
    },
    {
        id: 12,
        title: "Better Call Saul",
        image: "https://via.placeholder.com/400x600?text=Better+Call+Saul",
        year: 2015,
        rating: 9.3,
        genre: "Crime, Drama",
        duration: "48 min/época",
        description: "A história de como um advogado trabalhe horas se torna um criminalista estudante enquanto habilida sua carreira questionável nos negócios criminosos."
    }
];

// Categorizar filmes - será recalculado após carregar do admin
let trendingMovies = moviesData.slice(0, 4);
let originalMovies = moviesData.slice(4, 8);
let actionMovies = moviesData.filter(m => m.genre && m.genre.includes("Ação"));
let comedyMovies = [moviesData[3]]; // The Office
let dramaMovies = moviesData.filter(m => m.genre && m.genre.includes("Drama"));

// DOM Elements
const trendingCarousel = document.getElementById("trendingCarousel");
const originalsCarousel = document.getElementById("originalsCarousel");
const actionCarousel = document.getElementById("actionCarousel");
const comedyCarousel = document.getElementById("comedyCarousel");
const dramaCarousel = document.getElementById("dramaCarousel");
const heroContent = document.getElementById("heroContent");
const detailsModal = document.getElementById("detailsModal");
const modalClose = document.querySelector(".modal-close");
const searchInput = document.getElementById("searchInput");
const navLinks = document.querySelectorAll(".nav-link");

// Renderizar carousel
function renderCarousel(movies, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        container.appendChild(movieCard);
    });
}

// Criar card de filme
function createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card";
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const isInWatchlist = (currentUser.watchlist || []).includes(movie.id);
    const watchlistIcon = isInWatchlist ? '✓' : '➕';
    const watchlistClass = isInWatchlist ? 'in-watchlist' : '';
    
    card.innerHTML = `
        <img src="${movie.image}" alt="${movie.title}" class="movie-image" onerror="this.src='https://via.placeholder.com/400x600?text=No+Image'">
        <div class="movie-overlay">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-info">
                <span>${movie.year}</span>
                <span class="movie-rating">⭐ ${movie.rating}</span>
            </div>
            <div class="movie-actions">
                <button class="action-btn" onclick="event.stopPropagation(); ${movie.video ? `openVideoPlayer(${movie.id})` : 'alert("Vídeo não disponível")'}">▶ Assistir</button>
                <button class="action-btn ${watchlistClass}" onclick="event.stopPropagation(); toggleWatchlist(${movie.id})">${watchlistIcon}</button>
            </div>
        </div>
    `;
    
    card.addEventListener("click", () => openModal(movie));
    return card;
}

// Abrir modal de detalhes
function openModal(movie) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const isInWatchlist = (currentUser.watchlist || []).includes(movie.id);
    
    document.getElementById("modalImage").src = movie.image;
    document.getElementById("modalTitle").textContent = movie.title;
    document.getElementById("modalYear").textContent = `${movie.year}`;
    document.getElementById("modalRating").textContent = `⭐ ${movie.rating}/10`;
    document.getElementById("modalDescription").textContent = movie.description;
    document.getElementById("modalGenre").textContent = movie.genre;
    document.getElementById("modalDuration").textContent = movie.duration;
    
    // Botão de play
    const playBtn = document.getElementById("modalPlayBtn");
    playBtn.onclick = () => {
        if (movie.video) {
            closeModal();
            openVideoPlayer(movie.id);
        } else {
            alert('Vídeo não disponível para este filme!');
        }
    };

    // Botão de Minha Lista
    const watchlistBtn = document.querySelector('.btn-secondary');
    watchlistBtn.textContent = isInWatchlist ? '✓ Minha Lista' : '➕ Minha Lista';
    watchlistBtn.style.backgroundColor = isInWatchlist ? 'var(--primary-color)' : '';
    watchlistBtn.onclick = () => {
        toggleWatchlist(movie.id);
        // Atualizar o botão após toggle
        const updated = JSON.parse(localStorage.getItem('currentUser')) || {};
        const newIsInWatchlist = (updated.watchlist || []).includes(movie.id);
        watchlistBtn.textContent = newIsInWatchlist ? '✓ Minha Lista' : '➕ Minha Lista';
        watchlistBtn.style.backgroundColor = newIsInWatchlist ? 'var(--primary-color)' : '';
    };
    
    detailsModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

// Fechar modal
function closeModal() {
    detailsModal.classList.remove("active");
    document.body.style.overflow = "auto";
}

// Hero section
function setupHero() {
    const featuredMovie = moviesData[0];
    heroContent.innerHTML = `
        <h1>${featuredMovie.title}</h1>
        <p>${featuredMovie.description}</p>
        <div class="hero-buttons">
            <button class="btn btn-primary"><i class="fas fa-play"></i> Assistir Agora</button>
            <button class="btn btn-secondary"><i class="fas fa-info-circle"></i> Mais Informações</button>
        </div>
    `;
}

// Buscar filmes
function searchMovies(query) {
    const results = moviesData.filter(movie => 
        movie.title.toLowerCase().includes(query.toLowerCase())
    );
    
    if (results.length > 0) {
        trendingCarousel.innerHTML = "";
        results.forEach(movie => {
            const movieCard = createMovieCard(movie);
            trendingCarousel.appendChild(movieCard);
        });
    }
}

// Event Listeners
modalClose.addEventListener("click", closeModal);

detailsModal.addEventListener("click", (e) => {
    if (e.target === detailsModal) {
        closeModal();
    }
});

searchInput.addEventListener("input", (e) => {
    if (e.target.value.trim() !== "") {
        searchMovies(e.target.value);
    } else {
        renderCarousel(trendingMovies, "trendingCarousel");
    }
});

// Navegação
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
    });
});

// Função para alternar menu do usuário
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu && !userMenu.contains(e.target)) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.style.display = 'none';
    }
});

// Carregar filmes do Admin se existirem
function loadMoviesFromAdmin() {
    const adminMovies = JSON.parse(localStorage.getItem('adminMovies'));
    if (adminMovies && adminMovies.length > 0) {
        moviesData = adminMovies;
        // Recalcular categorias após carregar novos filmes
        recalculateCategories();
    }
}

// Recalcular categorias baseado nos filmes atuais
function recalculateCategories() {
    trendingMovies = moviesData.slice(0, 4);
    originalMovies = moviesData.slice(4, Math.min(8, moviesData.length));
    actionMovies = moviesData.filter(m => m.genre && m.genre.includes("Ação"));
    comedyMovies = moviesData.filter(m => m.genre && m.genre.includes("Comédia"));
    dramaMovies = moviesData.filter(m => m.genre && m.genre.includes("Drama"));
}

// Adicionar/Remover da Watchlist
function toggleWatchlist(movieId) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    if (!currentUser.watchlist) {
        currentUser.watchlist = [];
    }

    const index = currentUser.watchlist.indexOf(movieId);
    if (index > -1) {
        // Remover da watchlist
        currentUser.watchlist.splice(index, 1);
    } else {
        // Adicionar à watchlist
        currentUser.watchlist.push(movieId);
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    logActivity(currentUser.id, 'watchlist_toggle', `${index > -1 ? 'Removido de' : 'Adicionado a'} Minha Lista`);
    
    // Atualizar UI - renderizar novamente
    renderAllCarousels();
}

// Marcar como assistido
function markMovieAsWatched(movieId, currentUser) {
    if (!currentUser) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
    if (!currentUser) return;

    if (!currentUser.watchedMovies) {
        currentUser.watchedMovies = [];
    }

    // Verificar se já foi assistido
    const alreadyWatched = currentUser.watchedMovies.find(w => w.movieId === movieId);
    if (!alreadyWatched) {
        currentUser.watchedMovies.push({
            movieId: movieId,
            watchedDate: new Date().toISOString(),
            progress: 0
        });
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    logActivity(currentUser.id, 'watch_movie', `Iniciou reprodução de filme ID: ${movieId}`);
}

// Renderizar todos os carousels
function renderAllCarousels() {
    loadMoviesFromAdmin();
    renderCarousel(trendingMovies, "trendingCarousel");
    renderCarousel(originalMovies, "originalsCarousel");
    renderCarousel(actionMovies, "actionCarousel");
    renderCarousel(comedyMovies, "comedyCarousel");
    renderCarousel(dramaMovies, "dramaCarousel");
}

// Abrir Modal de Vídeo
function openVideoPlayer(movieId) {
    const movie = moviesData.find(m => m.id === movieId);
    if (!movie) return;

    if (!movie.video) {
        alert('Vídeo não disponível para este filme!');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const videoPlayer = document.createElement('div');
    videoPlayer.className = 'video-player-modal';
    videoPlayer.innerHTML = `
        <div class="video-player-content">
            <button class="video-player-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            <div class="video-player-title">${movie.title}</div>
            <video id="mainVideo" width="100%" height="100%" controls style="background: black;">
                ${movie.videoType === 'url' 
                    ? `<source src="${movie.video}">` 
                    : ''}
                Seu navegador não suporta reprodução de vídeo.
            </video>
        </div>
    `;

    if (movie.videoType !== 'url') {
        videoPlayer.querySelector('video').src = movie.video;
    }

    videoPlayer.addEventListener('click', (e) => {
        if (e.target === videoPlayer) {
            videoPlayer.remove();
        }
    });

    document.body.appendChild(videoPlayer);
    document.body.style.overflow = 'hidden';

    // Marcar como assistido quando o vídeo começa a reproduzir
    const video = videoPlayer.querySelector('video');
    video.addEventListener('playing', () => {
        markMovieAsWatched(movieId, currentUser);
    }, { once: true });

    // Fechar e atualizar UI quando sair
    const closeBtn = videoPlayer.querySelector('.video-player-close');
    closeBtn.addEventListener('click', () => {
        document.body.style.overflow = 'auto';
        videoPlayer.remove();
    });
}

// Estilo do player de vídeo
const style = document.createElement('style');
style.textContent = `
    .video-player-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.95);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    }

    .video-player-content {
        position: relative;
        width: 90%;
        height: 90%;
        max-width: 1200px;
        background: black;
        border-radius: 8px;
        overflow: hidden;
    }

    .video-player-close {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        z-index: 100;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
    }

    .video-player-close:hover {
        background: rgba(229,9,20,0.8);
    }

    .video-player-title {
        position: absolute;
        top: 15px;
        left: 15px;
        color: white;
        font-size: 18px;
        font-weight: bold;
        z-index: 50;
    }

    @media (max-width: 768px) {
        .video-player-content {
            width: 100%;
            height: 100%;
            border-radius: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    // Verificar autenticação
    if (!checkAuthAccess()) return;

    // Carregar filmes do admin e recalcular categorias
    loadMoviesFromAdmin();
    lastMoviesHash = getMoviesHash(); // Inicializar hash
    
    setupHero();
    renderCarousel(trendingMovies, "trendingCarousel");
    renderCarousel(originalMovies, "originalsCarousel");
    renderCarousel(actionMovies, "actionCarousel");
    renderCarousel(comedyMovies, "comedyCarousel");
    renderCarousel(dramaMovies, "dramaCarousel");
    
    // ===== SINCRONIZAÇÃO EM TEMPO REAL =====
    
    // Detectar mudanças no localStorage (de outras abas)
    window.addEventListener('storage', (e) => {
        if (e.key === 'adminMovies') {
            console.log('📡 Mudança detectada em outra aba!');
            syncMoviesFromAdmin();
        }
        
        // Detectar notificação de novo filme
        if (e.key === 'movieNotification') {
            const notification = JSON.parse(e.newValue || '{}');
            if (notification.type === 'new_movie') {
                showUpdateNotification(notification.movieTitle);
            }
        }
    });
    
    // Polling periódico a cada 2 segundos para detectar mudanças
    setInterval(() => {
        syncMoviesFromAdmin();
    }, 2000);
    
    console.log('✅ Sistema de sincronização em tempo real ativado!');
});

// Scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Tecla ESC para fechar modal
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && detailsModal.classList.contains("active")) {
        closeModal();
    }
});
