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

        // Инициализация работодателя
        this.employerManager.init();
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
                // Убираем active у всех вкладок
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

        // Обновляем данные при переключении на определённые вкладки
        if (tabId === 'applications') this.renderApplications();
        if (tabId === 'favorites') this.renderFavorites();
        if (tabId === 'employer') {
            // EmployerManager сам управляет своим состоянием
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

    // ==================== ПРОФИЛЬ ====================
    initProfileForm() {
        const form = document.getElementById('profile-form');
        if (!form) return;

        document.getElementById('input-name').value = this.auth.getUsername() || '';
        document.getElementById('input-email').value = localStorage.getItem('jobfinder_email') || '';

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('input-name').value.trim();
            const email = document.getElementById('input-email').value.trim();
            const phone = document.getElementById('input-phone').value.trim();
            const city = document.getElementById('input-city').value.trim();

            if (name) localStorage.setItem('jobfinder_username', name);
            if (email) localStorage.setItem('jobfinder_email', email);
            if (phone) localStorage.setItem('jobfinder_phone', phone);
            if (city) localStorage.setItem('jobfinder_city', city);

            this.renderUserInfo();
            this.showNotification('Данные успешно сохранены!', 'success');
        });
    }

    // ==================== РЕЗЮМЕ ====================
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

    // ==================== ОТКЛИКИ И ИЗБРАННОЕ ====================
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