// src/js/main.js
import '../styles/main.css';
import { VacancyManager } from './modules/VacancyManager.js';
import { Modal } from './modules/Modal.js';
import { UI } from './modules/UI.js';
import { Auth } from './modules/Auth.js';

class JobFinderApp {
  constructor() {
    this.vacancyManager = new VacancyManager();  // пока без аргумента
    this.modal = new Modal();
    this.auth = new Auth();
    console.log('🚀 JobFinder инициализирован');
  }

  async init() {
    this.auth.updateUI();
    this.updateHeaderUI()
    this.initLogout();

    // Передаём auth в init(), а не в конструктор
    await this.vacancyManager.init(this.auth);

    this.initAuthModals();
    this.initMobileMenu();
    this.initAuthRequiredModal();

    console.log('✅ Приложение запущено с системой авторизации');
  }

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

    document.getElementById('login-submit')?.addEventListener('click', () => {
      const email = document.getElementById('login-email').value.trim();
      if (email) {
        this.handleSuccessfulLogin(email);
      } else {
        alert('Введите email'); // можно заменить на красивую ошибку позже
      }
    });
  }

  handleSuccessfulLogin(email) {
    if (this.auth.login(email)) {
      this.modal.hide('login-modal');
      this.updateHeaderUI();
      // Можно показать уведомление
      console.log('✅ Вход выполнен успешно');
    }
  }

  initAuthModals() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');

    loginBtn?.addEventListener('click', () => this.modal.show('login-modal'));
    registerBtn?.addEventListener('click', () => this.modal.show('register-modal'));

    // Переключение между логином и регистрацией
    document.getElementById('switch-to-register')?.addEventListener('click', () => {
      this.modal.hide('login-modal');
      this.modal.show('register-modal');
    });

    document.getElementById('switch-to-login')?.addEventListener('click', () => {
      this.modal.hide('register-modal');
      this.modal.show('login-modal');
    });
  }

  initMobileMenu() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('header-nav');

    if (!burger || !nav) return;

    burger.addEventListener('click', () => {
      nav.classList.toggle('mobile-open');

      // Анимация бургера
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

  updateHeaderUI() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userPanel = document.getElementById('user-panel');
    const usernameDisplay = document.getElementById('username-display');

    if (this.auth.isAuthenticated()) {
      loginBtn.style.display = 'none';
      registerBtn.style.display = 'none';
      userPanel.style.display = 'flex';
      usernameDisplay.textContent = `👤 ${this.auth.getUsername()}`;
    } else {
      loginBtn.style.display = 'block';
      registerBtn.style.display = 'block';
      userPanel.style.display = 'none';
    }
  }
  initLogout() {
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      this.auth.logout();
      this.updateHeaderUI();
      console.log('👋 Выход выполнен');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new JobFinderApp();
  app.init();
});