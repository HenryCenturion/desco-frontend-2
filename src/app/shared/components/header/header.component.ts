import {Component, HostListener, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {ThemeService} from '../../services/theme.service';
import {TranslationService} from '../../services/translation.service';
import {UserService} from '../../../business/services/user.service';
import {TranslatePipe} from '@ngx-translate/core';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    TranslatePipe,
    NgClass,
    NgIf,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  isLogoVisible = false;
  language: string = 'en';
  isDarkMode = false;


  constructor(private router: Router,
              private userService: UserService,
              private themeService: ThemeService,
              private translationService: TranslationService) {}

  ngOnInit(): void {

    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      this.isDarkMode = isDarkMode;
      this.applyTheme();
    });

    if (typeof window !== 'undefined' && window.localStorage) {
      this.language = localStorage.getItem('language') || 'en';
    } else {
      this.language = 'en';
    }
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  changeLanguage(): void {
    this.language = this.language === 'en' ? 'es' : 'en';
    if(typeof window !== 'undefined' && window.localStorage){
      localStorage.setItem('language', this.language);
    }
    this.translationService.setLanguage(this.language);
  }


  applyTheme(): void {
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      if (typeof document !== 'undefined') {
        if (isDarkMode) {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      }
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.isMobileMenuOpen = false;
  }

  showLogo() {
    this.isLogoVisible = true;
  }

  hideLogo() {
    this.isLogoVisible = false;
  }

  isUserLoggedIn(): boolean {
    return this.userService.isUserLoggedIn();
  }

  logout() {
    this.userService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideMobileMenu = target.closest('#mobile-menu') || target.closest('[aria-controls="mobile-menu"]');
    const clickedInsideUserMenu = target.closest('#user-menu-button') || target.closest('[aria-labelledby="user-menu-button"]');

    if (!clickedInsideMobileMenu) {
      this.isMobileMenuOpen = false;
    }

    if (!clickedInsideUserMenu) {
      this.isUserMenuOpen = false;
    }
  }
}

