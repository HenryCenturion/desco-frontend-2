import { Injectable } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor(private translate: TranslateService) {
    this.initializeLanguage();
  }

  initializeLanguage() {
    if (this.isBrowser()) {
      const language = localStorage.getItem('language') || 'en';
      this.setLanguage(language);
    } else {
      this.setLanguage('en');
    }
  }

  setLanguage(language: string) {
    this.translate.use(language);
    if (this.isBrowser()) {
      localStorage.setItem('language', language);
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}

