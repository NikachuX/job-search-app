// src/js/main.js
import '../styles/main.css';
import { VacancyManager } from './modules/VacancyManager.js';
import { Modal } from './modules/Modal.js';
import { Auth } from './modules/Auth.js';
import { ProfileManager } from './modules/ProfileManager.js';


class JobFinderApp {
  constructor() {
    this.auth = new Auth();
    this.vacancyManager = new VacancyManager();
    this.modal = new Modal();
    this.profileManager = null;
    console.log('🚀 JobFinder инициализирован');
  }

  async init() {
    this.updateHeaderUI();
    this.initLogout();

    // Инициализируем менеджер вакансий
    await this.vacancyManager.init(this.auth);

    // Инициализируем модалки и меню
    this.initAuthModals();
    this.initMobileMenu();
    this.initAuthRequiredModal();
    this.initShowAllVacanciesButton();

    // Инициализация личного кабинета
    if (window.location.pathname.includes('profile.html') ||
      window.location.pathname.endsWith('profile')) {
      this.profileManager = new ProfileManager(this.auth);
      this.profileManager.init();
    }
    this.initFillResumeButton();
    console.log('✅ Приложение успешно запущено');
  }

  // ====================== АВТОРИЗАЦИЯ ======================
  initAuthModals() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');

    loginBtn?.addEventListener('click', () => this.modal.show('login-modal'));
    registerBtn?.addEventListener('click', () => this.modal.show('register-modal'));

    // Переключение между модалками
    document.getElementById('switch-to-register')?.addEventListener('click', () => {
      this.modal.hide('login-modal');
      this.modal.show('register-modal');
    });

    document.getElementById('switch-to-login')?.addEventListener('click', () => {
      this.modal.hide('register-modal');
      this.modal.show('login-modal');
    });

    // Логин
    const loginForm = document.getElementById('login-form');
    loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.clearErrors('login');

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();

      let valid = true;

      if (!email) {
        this.showFieldError('login-email', 'Введите email');
        valid = false;
      } else if (!email.includes('@')) {
        this.showFieldError('login-email', 'Введите корректный email');
        valid = false;
      }

      if (!password) {
        this.showFieldError('login-password', 'Введите пароль');
        valid = false;
      }

      if (valid) {
        this.handleSuccessfulLogin(email);
      }
    });

    // === РЕГИСТРАЦИЯ ===
    const registerForm = document.getElementById('register-form');
    registerForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.clearErrors('register');

      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value.trim();

      let valid = true;

      if (email && !email.includes('@')) {
        this.showFieldError('register-email', 'Введите корректный email');
        valid = false;
      }
      if (!email) {
        this.showFieldError('register-email', 'Email обязателен');
        valid = false;
      }
      if (!password) {
        this.showFieldError('register-password', 'Пароль обязателен');
        valid = false;
      } else if (password.length < 6) {
        this.showFieldError('register-password', 'Пароль должен содержать минимум 6 символов');
        valid = false;
      }

      if (valid) {
        const result = this.auth.register(name, email, password);
        if (result.success) {
          this.modal.hide('register-modal');
          this.updateHeaderUI();
          this.showNotification('Регистрация успешна!', 'success');
        } else {
          this.showNotification(result.message, 'error');
        }
      }
    });
  }

  // Вспомогательные методы
  showFieldError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + '-error');
    const input = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = message;
    if (input) input.classList.add('error');
  }

  clearErrors(prefix) {
    document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
      if (el.id.endsWith('-error')) el.textContent = '';
      else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.classList.remove('error');
    });
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

  handleSuccessfulLogin(email) {
    if (this.auth.login(email)) {
      this.modal.hide('login-modal');
      this.updateHeaderUI();
      console.log('✅ Вход выполнен');
    }
  }

  // ====================== МОБИЛЬНОЕ МЕНЮ ======================
  initMobileMenu() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('header-nav');

    if (!burger || !nav) return;

    burger.addEventListener('click', () => {
      nav.classList.toggle('mobile-open');

      const spans = burger.querySelectorAll('span');
      if (nav.classList.contains('mobile-open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
      } else {
        spans.forEach(s => {
          s.style.transform = '';
          s.style.opacity = '';
        });
      }
    });
  }

  // ====================== МОДАЛКА "ТРЕБУЕТСЯ АВТОРИЗАЦИЯ" ======================
  initAuthRequiredModal() {
    const goLogin = document.getElementById('go-to-login-btn');
    const goRegister = document.getElementById('go-to-register-btn');

    goLogin?.addEventListener('click', () => {
      this.modal.hide('auth-required-modal');
      this.modal.show('login-modal');
    });

    goRegister?.addEventListener('click', () => {
      this.modal.hide('auth-required-modal');
      this.modal.show('register-modal');
    });
  }

  // ====================== UI ШАПКИ ======================
  updateHeaderUI() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userPanel = document.getElementById('user-panel');
    const usernameDisplay = document.getElementById('username-display');

    if (this.auth.isAuthenticated()) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (registerBtn) registerBtn.style.display = 'none';
      if (userPanel) {
        userPanel.style.display = 'flex';
        if (usernameDisplay) usernameDisplay.textContent = `👤 ${this.auth.getUsername()}`;
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'block';
      if (registerBtn) registerBtn.style.display = 'block';
      if (userPanel) userPanel.style.display = 'none';
    }
  }

  initFillResumeButton() {
    const fillResumeBtn = document.getElementById('fill-resume-btn');
    if (!fillResumeBtn) return;

    fillResumeBtn.addEventListener('click', () => {
      if (this.auth.isAuthenticated()) {
        // Если залогинен — переходим в профиль на вкладку резюме
        window.location.href = 'profile.html#tab-resume';
      } else {
        // Если не залогинен — показываем модалку авторизации
        this.modal.show('auth-required-modal');
      }
    });
  }

  initLogout() {
    // Для всех страниц
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      this.auth.logout();
    });
  }

  initShowAllVacanciesButton() {
    const showAllBtn = document.getElementById('show-all-vacancies');
    if (!showAllBtn) return;

    showAllBtn.addEventListener('click', async () => {
      // Сбрасываем все фильтры
      const minSalaryInput = document.getElementById('min-salary');
      const sortSelect = document.getElementById('sort-select');
      const searchInputs = document.querySelectorAll('.search__input');

      if (minSalaryInput) minSalaryInput.value = '';
      if (sortSelect) sortSelect.value = 'default';
      if (searchInputs.length > 0) {
        searchInputs.forEach(input => input.value = '');
      }

      // Сбрасываем фильтры в VacancyManager и загружаем все вакансии
      if (this.vacancyManager) {
        await this.vacancyManager.loadVacancies({}); // пустой объект = все вакансии
      }

      // Прокручиваем к секции вакансий
      document.getElementById('vacancies').scrollIntoView({
        behavior: 'smooth'
      });

      console.log('Показаны все вакансии');
    });
  }
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
  const app = new JobFinderApp();
  app.init();
});