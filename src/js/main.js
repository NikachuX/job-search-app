// src/js/main.js
import '../styles/main.css';
import { VacancyManager } from './modules/VacancyManager.js';
import { Modal } from './modules/Modal.js';
import { UI } from './modules/UI.js';

class JobFinderApp {
  constructor() {
    this.vacancyManager = new VacancyManager();
    this.modal = new Modal();
    console.log('🚀 JobFinder — клиентская часть инициализирована (модульная архитектура + ООП)');
  }

  async init() {
    UI.updateLoginRegisterButtons();
    
    // Инициализируем менеджер вакансий
    await this.vacancyManager.init();

    // Красивые модальные окна для входа/регистрации
    this.initAuthModals();

    console.log('✅ Приложение полностью запущено');
  }

  initAuthModals() {
    const loginBtn = document.querySelector('.header__login');
    const registerBtn = document.querySelector('.header__register');

    loginBtn?.addEventListener('click', () => {
      this.modal.show('Вход в аккаунт', `
        <input type="email" placeholder="Email" class="modal-input">
        <input type="password" placeholder="Пароль" class="modal-input">
        <button class="modal-submit">Войти</button>
      `);
    });

    registerBtn?.addEventListener('click', () => {
      this.modal.show('Регистрация', `
        <input type="text" placeholder="Имя" class="modal-input">
        <input type="email" placeholder="Email" class="modal-input">
        <input type="password" placeholder="Пароль" class="modal-input">
        <button class="modal-submit">Зарегистрироваться</button>
      `);
    });
  }
}

// Запуск после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  const app = new JobFinderApp();
  app.init();
});