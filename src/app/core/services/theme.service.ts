import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal<boolean>(localStorage.getItem('cs_theme') === 'dark');

  constructor() {
    this.applyTheme(this.isDark());
  }

  toggle() {
    const next = !this.isDark();
    this.isDark.set(next);
    localStorage.setItem('cs_theme', next ? 'dark' : 'light');
    this.applyTheme(next);
  }

  private applyTheme(dark: boolean) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
}
