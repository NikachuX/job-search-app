// src/js/modules/ApiService.js
export class ApiService {
    constructor() {
        this.localMockUrl = '/src/data/mock-vacancies.json';
        this.externalApiUrl = 'https://fakejobs-api.vercel.app/jobs';   
        this.fallbackApiUrl = 'https://dummyjson.com/products?limit=20'; 
    }

    async getVacancies(filters = {}) {
        try {
            // 1. Пытаемся загрузить локальный мок
            const response = await fetch(this.localMockUrl);
            if (!response.ok) throw new Error('Local mock not available');

            let vacancies = await response.json();
            console.log('Вакансии загружены из локального JSON');

            vacancies = this.simulateRealTimeUpdate(vacancies);
            let filtered = this.applyFilters(vacancies, filters);
            filtered = this.applySort(filtered, filters.sortBy || 'default');

            return filtered;

        } catch (localError) {
            console.warn('Локальный mock недоступен, пробуем внешний Fake Jobs API...', localError.message);
            
            try {
                // 2. Пытаемся загрузить с хорошего Fake Jobs API
                const response = await fetch(this.externalApiUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                let jobs = await response.json();

                // Нормализуем данные под структуру нашего приложения
                let vacancies = this.normalizeFakeJobsApi(jobs);
                
                console.log(`Загружено ${vacancies.length} вакансий из FakeJobs API`);

                vacancies = this.simulateRealTimeUpdate(vacancies);
                let filtered = this.applyFilters(vacancies, filters);
                filtered = this.applySort(filtered, filters.sortBy || 'default');

                return filtered;

            } catch (externalError) {
                console.warn('Fake Jobs API тоже недоступен, используем запасной dummyjson...', externalError.message);

                const res = await fetch(this.fallbackApiUrl);
                const data = await res.json();
                let vacancies = this.normalizeExternalData(data.products || []);
                
                vacancies = this.simulateRealTimeUpdate(vacancies);
                let filtered = this.applyFilters(vacancies, filters);
                filtered = this.applySort(filtered, filters.sortBy || 'default');

                return filtered;
            }
        }
    }

    // НОРМАЛИЗАЦИЯ ДАННЫХ ИЗ FAKE JOBS API
    normalizeFakeJobsApi(jobs) {
        return jobs.map(job => ({
            id: parseInt(job.id) || Date.now() + Math.random(),
            title: job.title || 'Вакансия',
            company: job.company?.name || 'Компания',
            salary: this.parseSalary(job.salary) || Math.floor(Math.random() * 80000) + 60000,
            city: job.location || 'Удалённо',
            description: job.description || 'Интересная позиция с хорошими условиями.',
            requirements: ['Опыт работы от 1 года', 'Знание современных технологий'],
            type: job.type || 'full-time',
            views: Math.floor(Math.random() * 300) + 50
        }));
    }


    parseSalary(salaryStr) {
        if (!salaryStr) return null;
        const match = salaryStr.match(/(\d+)/);
        if (match) {
            let num = parseInt(match[1]);
            if (salaryStr.includes('K')) num *= 1000;
            return num;
        }
        return null;
    }

    simulateRealTimeUpdate(vacancies) {
        return vacancies.map(v => ({
            ...v,
            views: (v.views || 50) + Math.floor(Math.random() * 10)
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