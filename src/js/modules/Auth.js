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
        this.isLoggedIn = false;
        this.username = null;
        localStorage.removeItem('jobfinder_logged_in');
        localStorage.removeItem('jobfinder_username');
        this.updateUI();
    }
}