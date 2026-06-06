// src/js/modules/EmployerManager.js
export class EmployerManager {
    constructor(auth) {
        this.auth = auth;
        this.keyMyVacancies = 'employer_my_vacancies';
        this.externalApiUrl = 'https://fakejobs-api.vercel.app/jobs';
        this.currentRole = 'candidate'; 
    }

    init() {
        this.bindRoleSwitcher();
        this.switchRole(this.currentRole);
        this.bindPublishVacancy();
    }

    bindRoleSwitcher() {
        const candidateBtn = document.getElementById('role-candidate');
        const employerBtn = document.getElementById('role-employer');

        candidateBtn?.addEventListener('click', () => this.switchRole('candidate'));
        employerBtn?.addEventListener('click', () => this.switchRole('employer'));
    }

    switchRole(role) {
        this.currentRole = role;

        document.getElementById('role-candidate')?.classList.toggle('active', role === 'candidate');
        document.getElementById('role-employer')?.classList.toggle('active', role === 'employer');

        const employerMode = document.getElementById('employer-mode');
        const candidateMode = document.getElementById('candidate-mode');

        if (employerMode && candidateMode) {
            employerMode.style.display = (role === 'employer') ? 'block' : 'none';
            candidateMode.style.display = (role === 'candidate') ? 'block' : 'none';
        }

        if (role === 'employer') {
            this.loadMyVacancies();
            this.loadEmployerApplications();
        }
    }

    // ====================== ПУБЛИКАЦИЯ ВАКАНСИИ ======================
    bindPublishVacancy() {
        const form = document.getElementById('publish-vacancy-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            this.clearVacancyErrors();

            const title = document.getElementById('new-vacancy-title').value.trim();
            const company = document.getElementById('new-vacancy-company').value.trim() || 'Моя Компания';
            const salaryInput = document.getElementById('new-vacancy-salary').value;
            const salary = Number(salaryInput) || 0;
            const city = document.getElementById('new-vacancy-city').value.trim() || 'Не указан';
            const description = document.getElementById('new-vacancy-description').value.trim();

            let valid = true;

            // Валидация должности
            if (!title) {
                this.showFieldError('new-vacancy-title', 'Должность обязательна');
                valid = false;
            } else if (title.length < 3) {
                this.showFieldError('new-vacancy-title', 'Название должности слишком короткое (минимум 3 символа)');
                valid = false;
            }

            // Валидация описания
            if (!description) {
                this.showFieldError('new-vacancy-description', 'Описание вакансии обязательно');
                valid = false;
            } else if (description.length < 20) {
                this.showFieldError('new-vacancy-description', 'Описание должно содержать минимум 20 символов');
                valid = false;
            }

            // Валидация зарплаты
            if (salaryInput) {
                if (salary < 10000) {
                    this.showFieldError('new-vacancy-salary', 'Зарплата должна быть не менее 10 000 ₽');
                    valid = false;
                } else if (salary > 1000000) {
                    this.showFieldError('new-vacancy-salary', 'Зарплата не может превышать 1 000 000 ₽');
                    valid = false;
                }
            }

            if (!valid) return;

            // Показываем процесс публикации
            const btn = document.getElementById('publish-vacancy-btn');
            btn.disabled = true;
            btn.textContent = 'Публикация...';

            const newVacancy = {
                id: 'emp_' + Date.now(),
                title,
                company,
                salary,
                city,
                description: description || 'Описание вакансии не указано',
                postedAt: new Date().toISOString(),
                applicationsCount: 0
            };

            try {
                await this.sendToExternalApi(newVacancy);
                console.log('✅ Вакансия отправлена на внешний Fake Jobs API');
            } catch (apiError) {
                console.warn('⚠️ Не удалось отправить на внешний API:', apiError.message);
            }

            this.addMyVacancy(newVacancy);
            this.clearForm();
            this.loadMyVacancies();

            this.showNotification('✅ Вакансия успешно опубликована!', 'success');

            btn.disabled = false;
            btn.textContent = 'Опубликовать вакансию';
        });
    }

    async sendToExternalApi(vacancy) {
        const payload = {
            title: vacancy.title,
            type: "Full-Time",
            location: vacancy.city,
            description: vacancy.description,
            salary: `${vacancy.salary} ₽`,
            company: {
                name: vacancy.company,
                description: "Компания, разместившая вакансию через JobFinder",
                contactEmail: "hr@company.com"
            }
        };

        const response = await fetch(this.externalApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }

        return await response.json();
    }

    addMyVacancy(vacancy) {
        let vacancies = JSON.parse(localStorage.getItem(this.keyMyVacancies)) || [];
        vacancies.unshift(vacancy);
        localStorage.setItem(this.keyMyVacancies, JSON.stringify(vacancies));
    }

    clearForm() {
        document.getElementById('new-vacancy-title').value = '';
        document.getElementById('new-vacancy-company').value = '';
        document.getElementById('new-vacancy-salary').value = '';
        document.getElementById('new-vacancy-city').value = '';
        document.getElementById('new-vacancy-description').value = '';
    }

    loadMyVacancies() {
        const container = document.getElementById('my-vacancies-list');
        if (!container) return;

        const vacancies = JSON.parse(localStorage.getItem(this.keyMyVacancies)) || [];

        if (vacancies.length === 0) {
            container.innerHTML = `<p style="color:#64748b; text-align:center; padding:40px 20px;">У вас пока нет размещённых вакансий</p>`;
            return;
        }

        container.innerHTML = vacancies.map(v => `
            <div class="employer-card">
                <h3>${v.title}</h3>
                <p><strong>${v.company}</strong> • ${v.city}</p>
                <p style="color:var(--color-primary); font-weight:600;">от ${v.salary.toLocaleString('ru-RU')} ₽</p>
                <p style="font-size:14px; color:#64748b; margin-top:8px;">${v.description.substring(0, 150)}${v.description.length > 150 ? '...' : ''}</p>
                <small>Опубликовано: ${new Date(v.postedAt).toLocaleDateString('ru-RU')}</small>
            </div>
        `).join('');
    }

    loadEmployerApplications() {
        const container = document.getElementById('employer-applications-list');
        if (!container) return;

        const applications = JSON.parse(localStorage.getItem('jobfinder_applications')) || [];

        if (applications.length === 0) {
            container.innerHTML = `<p style="color:#64748b; text-align:center; padding:40px 20px;">Пока нет откликов на ваши вакансии</p>`;
            return;
        }

        container.innerHTML = applications.map(app => `
            <div class="employer-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <strong>${app.title}</strong><br>
                        <span style="color:#64748b;">Кандидат откликнулся</span>
                    </div>
                    <div>
                        <button class="employer-action-btn accept-btn" data-id="${app.id}">Принять</button>
                        <button class="employer-action-btn reject-btn" data-id="${app.id}">Отклонить</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ====================== ВАЛИДАЦИЯ ======================
    showFieldError(fieldId, message) {
        const errorEl = document.getElementById(fieldId + '-error');
        const input = document.getElementById(fieldId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
        if (input) input.classList.add('error');
    }

    clearVacancyErrors() {
        const fields = [
            'new-vacancy-title',
            'new-vacancy-company',
            'new-vacancy-salary',
            'new-vacancy-city',
            'new-vacancy-description'
        ];
        fields.forEach(fieldId => {
            const errorEl = document.getElementById(fieldId + '-error');
            const input = document.getElementById(fieldId);
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('show');
            }
            if (input) input.classList.remove('error');
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
}