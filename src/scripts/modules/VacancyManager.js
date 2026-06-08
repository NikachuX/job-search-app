import { ApiService } from './ApiService.js';
import { Favorites } from './Favorites.js';
import { Modal } from './Modal.js';
import { Applications } from './Applications.js';

export class VacancyManager {
    constructor() {
        this.api = new ApiService();
        this.favorites = new Favorites();
        this.applications = new Applications();
        this.modal = new Modal();
        this.auth = null;
        this.currentVacancies = [];
        this.filteredVacancies = [];
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.currentFilters = {};
    }

    async init(auth) {
        if (auth) {
            this.auth = auth;
        }

        await this.loadVacancies();
        this.renderVacancies();
        this.bindEvents();
    }

    async loadVacancies(filters = {}) {
        this.showLoading();

        try {
            this.currentFilters = { ...this.currentFilters, ...filters };
            this.currentVacancies = await this.api.getVacancies(this.currentFilters);
            this.filteredVacancies = [...this.currentVacancies];
            this.currentPage = 1;
        } catch (error) {
            console.error('Ошибка загрузки вакансий:', error);
            this.filteredVacancies = [];
        } finally {
            this.hideLoading();
            this.renderVacancies();
        }
    }

    renderVacancies() {
        const container = document.getElementById('vacancies-list');
        if (!container) return;

        this.hideLoading();

        if (this.filteredVacancies.length === 0) {
            container.innerHTML = `
        <div style="text-align:center; padding:60px 20px; color:#64748b;">
          <p style="font-size:18px;">😔 По вашему запросу ничего не найдено</p>
          <p>Попробуйте изменить параметры поиска или фильтры</p>
        </div>
      `;
            return;
        }

        container.innerHTML = '';

        const template = document.getElementById('vacancy-template');
        if (!template) {
            console.error('Шаблон #vacancy-template не найден!');
            return;
        }

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageItems = this.filteredVacancies.slice(start, end);

        pageItems.forEach(vacancy => {
            const isFav = this.favorites.isFavorite(vacancy.id);

            // Клонируем шаблон
            const card = template.content.cloneNode(true).querySelector('.vacancy-row');

            // Заполняем данными
            card.querySelector('.vacancy-row__title').textContent = vacancy.title;
            card.querySelector('.vacancy-row__salary').textContent = `от ${vacancy.salary.toLocaleString('ru-RU')} ₽`;
            card.querySelector('.vacancy-row__city').textContent = vacancy.city;

            // Кнопки
            const favoriteBtn = card.querySelector('.favorite-btn');
            const applyBtn = card.querySelector('.apply-btn');
            const detailBtn = card.querySelector('.detail-btn');

            favoriteBtn.innerHTML = isFav ? '❤️' : '♡';
            favoriteBtn.classList.toggle('active', isFav);
            favoriteBtn.dataset.id = vacancy.id;

            applyBtn.dataset.id = vacancy.id;
            detailBtn.dataset.id = vacancy.id;

            container.appendChild(card);
        });

        this.renderShowMoreButton(container);
    }

    renderShowMoreButton(container) {
        const oldBtn = document.querySelector('.show-more-btn');
        if (oldBtn) oldBtn.remove();

        if (this.currentPage * this.itemsPerPage < this.filteredVacancies.length) {
            const btn = document.createElement('button');
            btn.className = 'vacancy-row__btn show-more-btn';
            btn.style.display = 'block';
            btn.style.margin = '40px auto 20px';
            btn.textContent = `Показать ещё (${this.filteredVacancies.length - this.currentPage * this.itemsPerPage} осталось)`;

            btn.addEventListener('click', () => {
                this.currentPage++;
                this.renderVacancies();
            });

            container.parentNode.appendChild(btn);
        }
    }



    bindEvents() {
        document.addEventListener('click', async (e) => {
            const target = e.target;

            if (target.classList.contains('apply-btn')) {
                if (!this.auth || !this.auth.isAuthenticated()) {
                    this.modal.show('auth-required-modal');
                    return;
                }

                const id = parseInt(target.dataset.id);
                const vacancy = this.currentVacancies.find(v => v.id === id);

                if (vacancy) {
                    const added = this.applications.add(vacancy);

                    if (added) {
                        target.textContent = '✓ Отклик отправлен';
                        target.style.background = '#10b981';
                        target.disabled = true;

                        // Показываем уведомление
                        this.showNotification('Отклик успешно отправлен!', 'success');
                    } else {
                        this.showNotification('Вы уже откликались на эту вакансию', 'info');
                    }
                }
            }

            if (target.classList.contains('favorite-btn')) {
                if (!this.auth || !this.auth.isAuthenticated()) {
                    this.modal.show('auth-required-modal');
                    return;
                }

                const id = parseInt(target.dataset.id);
                this.favorites.toggle(id);
                this.renderVacancies();
            }

            if (target.classList.contains('detail-btn')) {
                const id = parseInt(target.dataset.id);
                const vacancy = this.currentVacancies.find(v => v.id === id);
                if (vacancy) this.showVacancyDetail(vacancy);
            }
        });

        const searchForm = document.querySelector('.search');
        if (searchForm) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const inputs = searchForm.querySelectorAll('input');
                const query = inputs[0].value.trim();
                const city = inputs[1] ? inputs[1].value.trim() : '';

                await this.loadVacancies({ query, city });
                this.renderVacancies();
            });
        }

        const applyFiltersBtn = document.getElementById('apply-filters');
        const minSalaryInput = document.getElementById('min-salary');
        const sortSelect = document.getElementById('sort-select');

        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', async () => {
                const minSalary = minSalaryInput.value ? Number(minSalaryInput.value) : null;
                const sortBy = sortSelect.value;

                await this.loadVacancies({ minSalary, sortBy });
                this.renderVacancies();
            });
        }

        document.querySelectorAll('.tip-card').forEach(card => {
            card.style.cursor = 'pointer';

            card.addEventListener('click', () => {
                const title = card.querySelector('h3').textContent.trim();
                const shortText = card.querySelector('p').textContent.trim();

                const fullContent = `
          <p style="line-height: 1.7; font-size: 16px; margin-bottom: 24px;">
            ${shortText}
          </p>
          <p style="color: #64748b; font-size: 15px;">
            Этот совет демонстрирует интерактивность клиентской части приложения. 
            В реальном проекте здесь была бы полная статья с практическими рекомендациями, 
            примерами и дополнительными материалами.
          </p>
          <button class="modal-submit" style="width:100%; margin-top: 20px;" 
                  onclick="document.getElementById('tip-modal').style.display='none'; document.body.style.overflow=''">
            Закрыть совет
          </button>
        `;

                this.modal.showTip(title, fullContent);
            });
        });


    }

    showVacancyDetail(vacancy) {
        this.modal.showDetail(vacancy);
    }

    showLoading() {
        const loading = document.getElementById('loading-indicator');
        const vacanciesList = document.querySelector('.vacancies__list');
        if (loading) loading.style.display = 'flex';
        if (vacanciesList) vacanciesList.style.display = 'none';
    }

    hideLoading() {
        const loading = document.getElementById('loading-indicator');
        const vacanciesList = document.querySelector('.vacancies__list');
        if (loading) loading.style.display = 'none';
        if (vacanciesList) vacanciesList.style.display = 'block';
    }

    showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 16px 24px;
        border-radius: 8px; color: white; z-index: 10000;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        font-weight: 500;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => notif.remove(), 3000);
}
}