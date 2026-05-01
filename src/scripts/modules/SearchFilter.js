export class SearchFilter {
  constructor() {
    this.debounceTimer = null;
  }

  debounce(callback, delay = 300) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(callback, delay);
  }
}