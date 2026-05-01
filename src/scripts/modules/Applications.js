// src/js/modules/Applications.js
export class Applications {
    constructor() {
        this.key = 'jobfinder_applications';
        this.items = JSON.parse(localStorage.getItem(this.key)) || [];
    }

    add(vacancy) {
        // Проверяем, не было ли уже отклика
        if (this.items.some(app => app.id === vacancy.id)) {
            return false;
        }

        const application = {
            ...vacancy,
            appliedAt: new Date().toISOString(),
            status: 'pending' // pending, reviewed, rejected, accepted
        };

        this.items.unshift(application); // новые сверху
        localStorage.setItem(this.key, JSON.stringify(this.items));
        return true;
    }

    getAll() {
        return this.items;
    }

    getCount() {
        return this.items.length;
    }

    clear() {
        this.items = [];
        localStorage.removeItem(this.key);
    }
}