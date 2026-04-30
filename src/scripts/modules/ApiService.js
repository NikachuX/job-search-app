export class ApiService {
  constructor() {
    this.mockUrl = '/src/data/mock-vacancies.json';
    this.externalApi = 'https://dummyjson.com/products?limit=20';
  }

  async getVacancies(filters = {}) {
    try {
      const response = await fetch(this.mockUrl);
      let vacancies = await response.json();

      vacancies = this.simulateRealTimeUpdate(vacancies);
      let filtered = this.applyFilters(vacancies, filters);
      filtered = this.applySort(filtered, filters.sortBy || 'default');

      return filtered;
    } catch (error) {
      console.warn('Локальный мок недоступен, используем внешний API');
      const res = await fetch(this.externalApi);
      const data = await res.json();
      return this.normalizeExternalData(data.products || []);
    }
  }

  simulateRealTimeUpdate(vacancies) {
    return vacancies.map(v => ({
      ...v,
      views: (v.views || 50) + Math.floor(Math.random() * 8)
    }));
  }

  applyFilters(vacancies, filters) {
    return vacancies.filter(v => {
      const matchQuery = !filters.query ||
        (v.title && v.title.toLowerCase().includes(filters.query.toLowerCase())) ||
        (v.company && v.company.toLowerCase().includes(filters.query.toLowerCase()));

      const matchCity = !filters.city ||
        (v.city && v.city.toLowerCase().includes(filters.city.toLowerCase()));

      const matchSalary = !filters.minSalary || (v.salary && v.salary >= Number(filters.minSalary));

      return matchQuery && matchCity && matchSalary;
    });
  }

  applySort(vacancies, sortBy) {
    const copy = [...vacancies];
    if (sortBy === 'salary-desc') {
      return copy.sort((a, b) => (b.salary || 0) - (a.salary || 0));
    }
    if (sortBy === 'salary-asc') {
      return copy.sort((a, b) => (a.salary || 0) - (b.salary || 0));
    }
    if (sortBy === 'views-desc') {
      return copy.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return copy;
  }

  normalizeExternalData(items) {
    return items.map((item, index) => ({
      id: item.id || index + 1000,
      title: item.title || 'Вакансия в IT',
      company: item.brand || 'Компания',
      salary: Math.floor(Math.random() * 120000) + 60000,
      city: ['Москва', 'Санкт-Петербург', 'Удаленно', 'Новосибирск'][index % 4],
      description: item.description || 'Интересная позиция с хорошими условиями.',
      requirements: ['Опыт работы', 'Знание современных технологий'],
      type: 'full-time',
      views: Math.floor(Math.random() * 300) + 30
    }));
  }

  async applyToVacancy(vacancyId) {
    console.log(`[MOCK SERVER] Отклик на вакансию #${vacancyId} успешно отправлен`);
    return { success: true, message: 'Отклик отправлен! Работодатель свяжется с вами в течение 2 дней.' };
  }
}