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
    document.getElementById('login-submit')?.addEventListener('click', () => {
      const email = document.getElementById('login-email').value.trim();
      if (email) {
        this.handleSuccessfulLogin(email);
      } else {
        alert('Введите email');
      }
    });
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