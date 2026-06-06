export class Auth {
    constructor() {
        this.isLoggedIn = localStorage.getItem('jobfinder_logged_in') === 'true';
        this.username = localStorage.getItem('jobfinder_username') || null;
        this.usersKey = 'jobfinder_users';
    }

    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey)) || [];
    }

    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    register(name, email, password) {
        const users = this.getUsers();

        // Проверка на существование
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }

        const newUser = {
            id: Date.now(),
            name: name || email.split('@')[0],
            email: email.toLowerCase(),
            password: password, // В реальном проекте — хэширование!
            registeredAt: new Date().toISOString(),
            phone: '',
            city: ''
        };

        users.push(newUser);
        this.saveUsers(users);

        // Автоматический вход
        this.isLoggedIn = true;
        this.username = newUser.name;
        localStorage.setItem('jobfinder_logged_in', 'true');
        localStorage.setItem('jobfinder_username', newUser.name);
        localStorage.setItem('jobfinder_email', newUser.email);

        return { success: true, message: 'Регистрация прошла успешно!' };
    }

    login(email) {
        const users = this.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (user) {
            this.isLoggedIn = true;
            this.username = user.name;
            localStorage.setItem('jobfinder_logged_in', 'true');
            localStorage.setItem('jobfinder_username', user.name);
            localStorage.setItem('jobfinder_email', user.email);
            this.updateUI();
            return { success: true };
        }

        // Если пользователя нет — создаём "гостевой" вход (как было раньше)
        this.isLoggedIn = true;
        this.username = email.split('@')[0] || 'Пользователь';
        localStorage.setItem('jobfinder_logged_in', 'true');
        localStorage.setItem('jobfinder_username', this.username);
        this.updateUI();
        return { success: true };
    }

    isAuthenticated() {
        return this.isLoggedIn;
    }

    updateUI() {
        console.log(this.isLoggedIn
            ? `👤 Авторизован как ${this.username}`
            : '👤 Гость');
    }

    getUsername() {
        return this.username || localStorage.getItem('jobfinder_username') || 'Пользователь';
    }

    logout() {
        const keysToRemove = [
            'jobfinder_logged_in', 'jobfinder_username', 'jobfinder_email',
            'jobfinder_phone', 'jobfinder_city', 'jobfinder_favorites',
            'jobfinder_applications', 'jobfinder_resume', 'employer_my_vacancies'
        ];

        keysToRemove.forEach(key => localStorage.removeItem(key));

        this.isLoggedIn = false;
        this.username = null;

        window.location.href = './index.html';
    }
}