// src/js/modules/VacancyManager.js
import { ApiService } from './ApiService.js';
import { Favorites } from './Favorites.js';
import { Modal } from './Modal.js';

export class VacancyManager {
  constructor() {
    this.api = new ApiService();
    this.favorites = new Favorites();
    this.modal = new Modal();
    this.currentVacancies = [];
    this.currentPage = 1;
    this.itemsPerPage = 6;
  }

  async init() {
    await this.loadVacancies();
    this.renderVacancies();
    this.bindEvents();
  }

  async loadVacancies(filters = {}) {
    this.currentVacancies = await this.api.getVacancies(filters);
  }

  renderVacancies(vacancies = this.currentVacancies) {
    const container = document.querySelector('.vacancies__list');
    if (!container) return;

    container.innerHTML = '';

    const paginated = vacancies.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );

    paginated.forEach(vacancy => {
      const isFav = this.favorites.isFavorite(vacancy.id);
      const card = document.createElement('div');
      card.className = 'vacancy-row';
      card.innerHTML = `
        <div class="vacancy-row__title">${vacancy.title}</div>
        <div class="vacancy-row__salary">от ${vacancy.salary.toLocaleString('ru-RU')} ₽</div>
        <div class="vacancy-row__city">${vacancy.city}</div>
        <div class="vacancy-row__actions">
          <button class="vacancy-row__btn favorite-btn ${isFav ? 'active' : ''}" data-id="${vacancy.id}">
            ${isFav ? '❤️' : '♡'}
          </button>
          <button class="vacancy-row__btn apply-btn" data-id="${vacancy.id}">Откликнуться</button>
          <button class="vacancy-row__btn detail-btn" data-id="${vacancy.id}">Подробнее</button>
        </div>
      `;
      container.appendChild(card);
    });

    // Добавляем кнопку "Показать ещё" если нужно
    if (vacancies.length > this.currentPage * this.itemsPerPage) {
      // можно добавить отдельную кнопку
    }
  }

  bindEvents() {
    document.addEventListener('click', async (e) => {
      const target = e.target;

      if (target.classList.contains('apply-btn')) {
        const id = parseInt(target.dataset.id);
        const result = await this.api.applyToVacancy(id);
        target.textContent = '✓ Отклик отправлен';
        target.style.background = '#10b981';
        setTimeout(() => {
          target.textContent = 'Откликнуться';
          target.style.background = '';
        }, 2500);
      }

      if (target.classList.contains('favorite-btn')) {
        const id = parseInt(target.dataset.id);
        this.favorites.toggle(id);
        this.renderVacancies(); // перерендерим
      }

      if (target.classList.contains('detail-btn')) {
        const id = parseInt(target.dataset.id);
        const vacancy = this.currentVacancies.find(v => v.id === id);
        if (vacancy) this.showVacancyDetail(vacancy);
      }
    });

    // Поисковая форма
    const searchForm = document.querySelector('.search');
    if (searchForm) {
      searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchForm.querySelector('input').value.trim();
        const city = searchForm.querySelectorAll('input')[1]?.value.trim() || '';

        await this.loadVacancies({ query, city });
        this.currentPage = 1;
        this.renderVacancies();
      });
    }
  }

  showVacancyDetail(vacancy) {
    const html = `
      <h4>${vacancy.title}</h4>
      <p><strong>Компания:</strong> ${vacancy.company}</p>
      <p><strong>Зарплата:</strong> от ${vacancy.salary.toLocaleString('ru-RU')} ₽</p>
      <p><strong>Город:</strong> ${vacancy.city}</p>
      <p><strong>Описание:</strong> ${vacancy.description}</p>
      <h5>Требования:</h5>
      <ul>${vacancy.requirements.map(req => `<li>${req}</li>`).join('')}</ul>
      <button class="apply-btn" data-id="${vacancy.id}" style="width:100%; margin-top:20px;">Откликнуться на вакансию</button>
    `;
    this.modal.show('Подробная информация о вакансии', html);
  }
}