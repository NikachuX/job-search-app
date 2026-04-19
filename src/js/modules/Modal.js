// src/js/modules/Modal.js
export class Modal {
  constructor() {
    this.modal = null;
  }

  show(title, contentHTML, onClose = null) {
    if (this.modal) this.close();

    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.innerHTML = `
      <div class="modal">
        <div class="modal__header">
          <h3>${title}</h3>
          <button class="modal__close">✕</button>
        </div>
        <div class="modal__content">${contentHTML}</div>
      </div>
    `;

    document.body.appendChild(this.modal);
    document.body.style.overflow = 'hidden';

    this.modal.querySelector('.modal__close').addEventListener('click', () => this.close(onClose));
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close(onClose);
    });
  }

  close(callback) {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      document.body.style.overflow = '';
      if (callback) callback();
    }
  }
}