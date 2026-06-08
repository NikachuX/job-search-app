// src/js/modules/ProfileManager.js
import { Applications } from './Applications.js';
import { Favorites } from './Favorites.js';
import { EmployerManager } from './EmployerManager.js';

export class ProfileManager {
    constructor(auth) {
        this.auth = auth;
        this.applications = new Applications();
        this.favorites = new Favorites();
        this.employerManager = new EmployerManager(auth);
        this.currentTab = 'profile';
    }

    init() {
        this.renderUserInfo();
        this.bindTabSwitching();
        this.loadAllData();

        // Кнопка выхода
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            if (confirm('Вы действительно хотите выйти из аккаунта?')) {
                this.auth.logout();
            }
        });

        this.initProfileForm();
        this.initResume();
        this.employerManager.init();

        // JSON Экспорт / Импорт 
        this.initJsonExportImport();
    }

    initJsonExportImport() {
        // Экспорт
        document.getElementById('export-json-btn')?.addEventListener('click', () => {
            this.exportUserDataToJSON();
        });

        // Импорт
        document.getElementById('import-json-btn')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => this.importUserDataFromJSON(e);
            input.click();
        });
    }

    // JSON ЭКСПОРТ 
    exportUserDataToJSON() {
        const userData = {
            user: {
                name: this.auth.getUsername(),
                email: localStorage.getItem('jobfinder_email'),
                phone: localStorage.getItem('jobfinder_phone'),
                city: localStorage.getItem('jobfinder_city'),
                registeredAt: new Date().toISOString()
            },
            resume: localStorage.getItem('jobfinder_resume') || "",
            favorites: this.favorites.getAll(),
            applications: this.applications.getAll(),
            myVacancies: JSON.parse(localStorage.getItem('employer_my_vacancies') || '[]'),
            exportDate: new Date().toISOString()
        };

        const jsonString = JSON.stringify(userData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `jobfinder-data-${this.auth.getUsername() || 'user'}.json`;
        link.click();

        URL.revokeObjectURL(url);

        this.showNotification('✅ Данные успешно экспортированы в JSON!', 'success');
    }

    // JSON ИМПОРТ 
    importUserDataFromJSON(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                // Пример импорта основных данных
                if (data.user) {
                    if (data.user.name) localStorage.setItem('jobfinder_username', data.user.name);
                    if (data.user.email) localStorage.setItem('jobfinder_email', data.user.email);
                    if (data.user.phone) localStorage.setItem('jobfinder_phone', data.user.phone);
                    if (data.user.city) localStorage.setItem('jobfinder_city', data.user.city);
                }

                if (data.resume) localStorage.setItem('jobfinder_resume', data.resume);
                if (data.applications) localStorage.setItem('jobfinder_applications', JSON.stringify(data.applications));
                if (data.favorites) localStorage.setItem('jobfinder_favorites', JSON.stringify(data.favorites));
                if (data.myVacancies) localStorage.setItem('employer_my_vacancies', JSON.stringify(data.myVacancies));

                this.loadAllData();
                this.renderUserInfo();
                this.showNotification('✅ Данные успешно импортированы!', 'success');

            } catch (err) {
                this.showNotification('❌ Ошибка чтения JSON файла', 'error');
            }
        };
        reader.readAsText(file);
    }

    renderUserInfo() {
        const nameEl = document.getElementById('profile-name');
        const emailEl = document.getElementById('profile-email');
        const avatarEl = document.getElementById('profile-avatar');

        if (nameEl) nameEl.textContent = this.auth.getUsername() || 'Пользователь';
        if (emailEl) emailEl.textContent = localStorage.getItem('jobfinder_email') || 'user@example.com';
        if (avatarEl) avatarEl.textContent = '👤';
    }

    bindTabSwitching() {
        const tabs = document.querySelectorAll('.profile__tab');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const tabId = tab.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        document.querySelectorAll('.profile__tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const activeContent = document.getElementById(`tab-${tabId}`);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        this.currentTab = tabId;

        if (tabId === 'applications') this.renderApplications();
        if (tabId === 'favorites') this.renderFavorites();
        if (tabId === 'employer') {
        }
    }

    loadAllData() {
        this.renderApplications();
        this.renderFavorites();
        this.updateBadges();
    }

    updateBadges() {
        const appsCount = document.getElementById('apps-count');
        const favCount = document.getElementById('fav-count');

        if (appsCount) appsCount.textContent = this.applications.getCount();
        if (favCount) favCount.textContent = this.favorites.getAll().length;
    }

    // ПРОФИЛЬ 
    initProfileForm() {
        const form = document.getElementById('profile-form');
        if (!form) return;

        document.getElementById('input-name').value = this.auth.getUsername() || '';
        document.getElementById('input-email').value = localStorage.getItem('jobfinder_email') || '';
        document.getElementById('input-phone').value = localStorage.getItem('jobfinder_phone') || '';

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.clearProfileErrors();

            const name = document.getElementById('input-name').value.trim();
            const email = document.getElementById('input-email').value.trim();
            const phone = document.getElementById('input-phone').value.trim();
            const city = document.getElementById('input-city').value.trim();

            let valid = true;

            // ВАЛИДАЦИЯ ИМЕНИ 
            if (!name) {
                this.showFieldError('input-name', 'Имя обязательно');
                valid = false;
            }

            // ВАЛИДАЦИЯ EMAIL
            if (!email) {
                this.showFieldError('input-email', 'Email обязателен');
                valid = false;
            } else if (!email.includes('@') || !email.includes('.')) {
                this.showFieldError('input-email', 'Введите корректный email');
                valid = false;
            }

            // ВАЛИДАЦИЯ ТЕЛЕФОНА 
            if (phone) {
                if (!this.validatePhone(phone)) {
                    this.showFieldError('input-phone', 'Введите корректный номер телефона (+7XXXXXXXXXX или 8XXXXXXXXXX)');
                    valid = false;
                }
            }

            if (valid) {
                if (name) localStorage.setItem('jobfinder_username', name);
                if (email) localStorage.setItem('jobfinder_email', email);
                if (phone) localStorage.setItem('jobfinder_phone', phone);
                if (city) localStorage.setItem('jobfinder_city', city);

                this.renderUserInfo();
                this.showNotification('✅ Данные успешно сохранены!', 'success');
            }
        });
    }

    validatePhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.startsWith('7') || cleaned.startsWith('8');
        }
        if (cleaned.length === 10) {
            return true; 
        }

        return false;
    }

    showFieldError(fieldId, message) {
        const errorEl = document.getElementById(fieldId + '-error');
        const input = document.getElementById(fieldId);

        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
        if (input) input.classList.add('error');
    }

    clearProfileErrors() {
        const fields = ['input-name', 'input-email', 'input-phone', 'input-city'];
        fields.forEach(fieldId => {
            const errorEl = document.getElementById(fieldId + '-error');
            const input = document.getElementById(fieldId);
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('show');
            }
            if (input) input.classList.remove('error');
        });
    }

    // РЕЗЮМЕ 
    initResume() {
        const textarea = document.getElementById('resume-text');
        const saveBtn = document.getElementById('save-resume');
        const downloadBtn = document.getElementById('download-resume');

        textarea.value = localStorage.getItem('jobfinder_resume') || '';

        saveBtn?.addEventListener('click', () => {
            localStorage.setItem('jobfinder_resume', textarea.value);
            this.showNotification('Резюме сохранено!', 'success');
        });

        downloadBtn?.addEventListener('click', () => {
            if (textarea.value.trim()) {
                this.showNotification('Резюме скачивается... (мок)', 'success');
            } else {
                alert('Сначала заполните резюме');
            }
        });
    }

    // ОТКЛИКИ И ИЗБРАННОЕ
    renderApplications() {
        const container = document.getElementById('applications-list');
        if (!container) return;

        const apps = this.applications.getAll();

        if (apps.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:60px 20px; color:#64748b;">
                <p style="font-size:18px;">У вас пока нет откликов</p>
            </div>`;
            return;
        }

        container.innerHTML = apps.map(app => `
            <div class="vacancy-row">
                <div class="vacancy-row__title">${app.title}</div>
                <div class="vacancy-row__salary">от ${app.salary.toLocaleString('ru-RU')} ₽</div>
                <div style="color:#10b981;">${new Date(app.appliedAt).toLocaleDateString('ru-RU')}</div>
            </div>
        `).join('');
    }

    renderFavorites() {
        const container = document.getElementById('favorites-list');
        if (!container) return;

        const favIds = this.favorites.getAll();
        if (favIds.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding:60px; color:#64748b;">В избранном пока пусто</p>`;
            return;
        }

        container.innerHTML = `<p style="color:#64748b;">В избранном ${favIds.length} вакансий</p>`;
    }

    showNotification(message, type = 'success') {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed; top: 30px; right: 30px; padding: 16px 24px;
            border-radius: 12px; color: white; z-index: 10000; font-weight: 500;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        `;
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }
}