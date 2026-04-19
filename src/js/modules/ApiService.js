// src/js/modules/ApiService.js
export class ApiService {
  constructor() {
    this.mockUrl = '/src/data/mock-vacancies.json'; // создадим позже
    this.externalApi = 'https://jsonfakery.com/job-posts'; // публичный мок (или любой другой)
  }

  // Основной метод — получаем вакансии (с приоритетом на мок, fallback на внешний)
  async getVacancies(filters = {}) {
    try {
      // Сначала пытаемся взять из локального мока
      const response = await fetch(this.mockUrl);
      let vacancies = await response.json();

      // Имитация реального времени (добавляем случайные изменения)
      vacancies = this.simulateRealTimeUpdate(vacancies);

      // Применяем фильтры на клиенте
      return this.applyFilters(vacancies, filters);
    } catch (error) {
      console.warn('Local mock failed, using external API');
      // Fallback на внешний публичный API
      const res = await fetch(this.externalApi);
      const data = await res.json();
      return this.normalizeExternalData(data);
    }
  }

  simulateRealTimeUpdate(vacancies) {
    return vacancies.map(v => ({
      ...v,
      views: v.views + Math.floor(Math.random() * 5) // имитация просмотров
    }));
  }

  applyFilters(vacancies, filters) {
    return vacancies.filter(v => {
      const matchQuery = !filters.query || 
        v.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        v.company.toLowerCase().includes(filters.query.toLowerCase());
      
      const matchCity = !filters.city || 
        v.city.toLowerCase().includes(filters.city.toLowerCase());
      
      const matchSalary = !filters.minSalary || v.salary >= filters.minSalary;
      
      return matchQuery && matchCity && matchSalary;
    });
  }

  normalizeExternalData(data) {
    // Адаптируем внешние данные под нашу структуру
    return data.map((item, index) => ({
      id: item.id || index + 1000,
      title: item.title || 'Вакансия',
      company: item.company || 'Компания',
      salary: item.salary || 80000,
      city: item.location || 'Москва',
      description: item.description || 'Описание вакансии...',
      requirements: ['Опыт работы', 'Знание технологий'],
      type: 'full-time',
      views: Math.floor(Math.random() * 200) + 50
    }));
  }

  // Имитация отправки отклика (серверная часть замокана)
  async applyToVacancy(vacancyId) {
    console.log(`[MOCK SERVER] Отклик отправлен на вакансию #${vacancyId}`);
    // В реальном проекте здесь был бы POST-запрос
    return { success: true, message: 'Отклик успешно отправлен!' };
  }
}