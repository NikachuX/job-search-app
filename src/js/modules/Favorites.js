// src/js/modules/Favorites.js
export class Favorites {
  constructor() {
    this.key = 'jobfinder_favorites';
    this.items = JSON.parse(localStorage.getItem(this.key)) || [];
  }

  toggle(id) {
    if (this.items.includes(id)) {
      this.items = this.items.filter(itemId => itemId !== id);
    } else {
      this.items.push(id);
    }
    localStorage.setItem(this.key, JSON.stringify(this.items));
    return this.items.includes(id);
  }

  getAll() {
    return this.items;
  }

  isFavorite(id) {
    return this.items.includes(id);
  }
}