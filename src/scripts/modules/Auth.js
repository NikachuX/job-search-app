// src/js/modules/Auth.js
export class Auth {
    constructor() {
        this.isLoggedIn = localStorage.getItem('jobfinder_logged_in') === 'true';
        this.currentUser = null;
        this.usersKey = 'jobfinder_users';
        
        this.loadCurrentUser();
    }

    // Получить всех пользователей
    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey)) || [];
    }

    // Сохранить пользователей
    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users, null, 2));
    }

    getUsersAsJSON() {
        const users = this.getUsers().map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            registeredAt: user.registeredAt,
        }));
        return JSON.stringify(users, null, 2);
    }

    register(name, email, password) {
        const users = this.getUsers();

        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }

        const newUser = {
            id: Date.now(),
            name: name || email.split('@')[0],
            email: email.toLowerCase(),
            password: password,          
            registeredAt: new Date().toISOString(),
            phone: '',
            city: ''
        };

        users.push(newUser);
        this.saveUsers(users);

        // Автоматический вход
        this.loginUser(newUser);

        return { success: true, message: 'Регистрация прошла успешно!' };
    }

    login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return { success: false, message: 'Пользователь не найден' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Неверный пароль' };
        }

        this.loginUser(user);
        return { success: true };
    }

    loginUser(user) {
        this.isLoggedIn = true;
        this.currentUser = user;

        localStorage.setItem('jobfinder_logged_in', 'true');
        localStorage.setItem('jobfinder_username', user.name);
        localStorage.setItem('jobfinder_email', user.email);
        localStorage.setItem('jobfinder_current_user', JSON.stringify(user));
    }

    loadCurrentUser() {
        const savedUser = localStorage.getItem('jobfinder_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    isAuthenticated() {
        return this.isLoggedIn && !!this.currentUser;
    }

    getUsername() {
        return this.currentUser?.name || localStorage.getItem('jobfinder_username') || 'Пользователь';
    }

    logout() {
        const keysToRemove = [
            'jobfinder_logged_in', 'jobfinder_username', 'jobfinder_email',
            'jobfinder_phone', 'jobfinder_city', 'jobfinder_favorites',
            'jobfinder_applications', 'jobfinder_resume', 'employer_my_vacancies',
            'jobfinder_current_user'
        ];

        keysToRemove.forEach(key => localStorage.removeItem(key));

        this.isLoggedIn = false;
        this.currentUser = null;

        window.location.href = './index.html';
    }

    // Удобный метод для отладки
    logAllUsers() {
        console.log('Зарегистрированные пользователи:', this.getUsers());
        console.log('JSON пользователей:\n', this.getUsersAsJSON());
    }
}