import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'dark';
  
  constructor() {
    const dark = this.isDark();
    this.applyTheme(dark);
  }
  
  isDark(): boolean {
    return localStorage.getItem(this.storageKey) === 'true';
  }

  toggleDark(enable: boolean) {
    this.applyTheme(enable);
    localStorage.setItem(this.storageKey, enable ? 'true' : 'false');
  }

  private applyTheme(enable: boolean) {
    // Ionic 8 uses ion-palette-dark on html
    document.documentElement.classList.toggle('ion-palette-dark', enable);
    // Keep .dark just in case any custom css relies on it
    document.documentElement.classList.toggle('dark', enable);
    document.body.classList.toggle('dark', enable);
  }
}