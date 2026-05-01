export class Modal {
    constructor() {
        this.bindCloseEvents();
    }

    show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    showDetail(vacancy) {
        const modal = document.getElementById('detail-modal');
        const titleEl = document.getElementById('detail-title');
        const contentEl = document.getElementById('detail-content');

        if (!modal || !titleEl || !contentEl) return;

        titleEl.textContent = vacancy.title;

        contentEl.innerHTML = `
      <p><strong>Компания:</strong> ${vacancy.company}</p>
      <p><strong>Зарплата:</strong> от ${vacancy.salary.toLocaleString('ru-RU')} ₽</p>
      <p><strong>Город:</strong> ${vacancy.city}</p>
      <p><strong>Просмотров:</strong> ${vacancy.views}</p>
      <p><strong>Описание:</strong> ${vacancy.description}</p>
      <h5 style="margin: 16px 0 8px;">Требования:</h5>
      <ul style="padding-left:20px; line-height:1.6;">
        ${(vacancy.requirements || []).map(req => `<li>${req}</li>`).join('')}
      </ul>
      <button class="modal-submit apply-btn" data-id="${vacancy.id}" style="width:100%; margin-top:24px;">
        Откликнуться на вакансию
      </button>
    `;

        this.show('detail-modal');
    }
    
    showTip(title, contentHTML) {
        const modal = document.getElementById('tip-modal');
        const titleEl = document.getElementById('tip-modal-title');
        const contentEl = document.getElementById('tip-modal-content');

        if (!modal || !titleEl || !contentEl) return;

        titleEl.textContent = title;
        contentEl.innerHTML = contentHTML;

        this.show('tip-modal');
    }

    bindCloseEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal__close')) {
                const modalId = e.target.getAttribute('data-close');
                if (modalId) this.hide(modalId);
            }

            if (e.target.classList.contains('modal-backdrop')) {
                e.target.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
}