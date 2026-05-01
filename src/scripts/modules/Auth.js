export class Auth {
    constructor() {
        this.isLoggedIn = localStorage.getItem('jobfinder_logged_in') === 'true';
        this.username = localStorage.getItem('jobfinder_username') || null;
    }

    login(email) {
        this.isLoggedIn = true;
        this.username = email.split('@')[0] || 'Пользователь';
        localStorage.setItem('jobfinder_logged_in', 'true');
        localStorage.setItem('jobfinder_username', this.username);
        this.updateUI();
        return true;
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
        return this.username || 'Пользователь';
    }

    logout() {
        // ПОЛНАЯ ОЧИСТКА ВСЕХ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
        const keysToRemove = [
            'jobfinder_logged_in',
            'jobfinder_username',
            'jobfinder_email',
            'jobfinder_phone',
            'jobfinder_city',
            'jobfinder_favorites',
            'jobfinder_applications',
            'jobfinder_resume'
        ];

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        this.isLoggedIn = false;
        this.username = null;

        console.log('👋 Аккаунт полностью сброшен (localStorage очищен)');
        
        // Перезагружаем текущую страницу, чтобы всё обновилось
        window.location.href = './index.html';
    }

    getUsername() {
    return this.username || localStorage.getItem('jobfinder_username') || 'Пользователь';
}
}