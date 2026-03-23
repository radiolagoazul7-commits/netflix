// Sistema de Autenticação
class AuthSystem {
    constructor() {
        this.setupTabs();
        this.setupForms();
        this.checkAuthStatus();
    }

    setupTabs() {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Remover active de todas as abas
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

        // Adicionar active à aba selecionada
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Form`).classList.add('active');
    }

    setupForms() {
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        document.getElementById('guestBtn').addEventListener('click', () => {
            this.loginAsGuest();
        });

        document.getElementById('guestBtnSignup').addEventListener('click', () => {
            this.loginAsGuest();
        });
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const remember = document.getElementById('rememberMe').checked;
        const messageEl = document.getElementById('loginMessage');

        // Validações básicas
        if (!email || !password) {
            this.showMessage(messageEl, 'error', 'Por favor, preencha todos os campos!');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showMessage(messageEl, 'error', 'Email inválido!');
            return;
        }

        // Buscar usuário
        const users = JSON.parse(localStorage.getItem('appUsers')) || [];
        const user = users.find(u => u.email === email);

        if (!user) {
            this.showMessage(messageEl, 'error', 'Email ou senha incorretos!');
            return;
        }

        // Verificar senha (em produção, seria hash)
        if (user.password !== password) {
            this.showMessage(messageEl, 'error', 'Email ou senha incorretos!');
            return;
        }

        // Login bem-sucedido
        this.loginUser(user, remember);
        this.showMessage(messageEl, 'success', 'Login realizado com sucesso! Redirecionando...');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    handleSignup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
        const terms = document.getElementById('terms').checked;
        const messageEl = document.getElementById('signupMessage');

        // Validações
        if (!name || !email || !password || !passwordConfirm) {
            this.showMessage(messageEl, 'error', 'Por favor, preencha todos os campos!');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showMessage(messageEl, 'error', 'Email inválido!');
            return;
        }

        if (password.length < 6) {
            this.showMessage(messageEl, 'error', 'Senha deve ter no mínimo 6 caracteres!');
            return;
        }

        if (password !== passwordConfirm) {
            this.showMessage(messageEl, 'error', 'As senhas não coincidem!');
            return;
        }

        if (!terms) {
            this.showMessage(messageEl, 'error', 'Você deve aceitar os termos de serviço!');
            return;
        }

        // Verificar se email já existe
        const users = JSON.parse(localStorage.getItem('appUsers')) || [];
        if (users.some(u => u.email === email)) {
            this.showMessage(messageEl, 'error', 'Este email já está registrado!');
            return;
        }

        // Criar novo usuário
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password, // Em produção: usar bcrypt ou similar
            createdAt: new Date().toLocaleString('pt-BR'),
            avatar: this.generateAvatar(name),
            watchedMovies: [],
            watchlist: [],
            preferences: {
                theme: 'dark',
                notifications: true
            }
        };

        users.push(newUser);
        localStorage.setItem('appUsers', JSON.stringify(users));

        this.showMessage(messageEl, 'success', 'Conta criada com sucesso! Fazendo login...');
        
        setTimeout(() => {
            this.loginUser(newUser, true);
            window.location.href = 'index.html';
        }, 1500);
    }

    loginAsGuest() {
        const guestUser = {
            id: 'guest_' + Date.now(),
            name: 'Visitante',
            email: 'guest@netflix.local',
            isGuest: true,
            avatar: '👤',
            watchedMovies: [],
            watchlist: [],
            preferences: {
                theme: 'dark',
                notifications: false
            }
        };

        this.loginUser(guestUser, false);
        window.location.href = 'index.html';
    }

    loginUser(user, remember) {
        // Salvar usuário logado
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        
        if (remember) {
            localStorage.setItem('rememberLogin', 'true');
        }

        // Registrar atividade
        this.logActivity(user.id, 'login', `${user.name} fez login`);
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showMessage(element, type, message) {
        element.textContent = message;
        element.className = `message ${type}`;
    }

    generateAvatar(name) {
        const colors = ['🔴', '🟢', '🔵', '⭐', '🎬', '🎭', '🎪', '🎨'];
        return colors[name.length % colors.length];
    }

    logActivity(userId, action, description) {
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

    checkAuthStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const rememberLogin = localStorage.getItem('rememberLogin') === 'true';

        if (isLoggedIn && rememberLogin) {
            // Auto-login se tiver "manter conectado" ativo
            // (Você pode querer redirecionar direto para index.html aqui)
        }
    }
}

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
});
