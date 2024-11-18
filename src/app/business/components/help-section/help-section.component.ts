import {Component, OnInit} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {NgIf} from '@angular/common';
import {ThemeService} from '../../../shared/services/theme.service';

@Component({
  selector: 'app-help-section',
  standalone: true,
  imports: [
    TranslatePipe,
    NgIf
  ],
  templateUrl: './help-section.component.html',
  styleUrl: './help-section.component.css'
})
export class HelpSectionComponent implements OnInit {

  activeAccordion: string | null = null;
  showVideo: boolean = false;
  isDarkMode: boolean = false;
  currentLanguage: string | undefined;

  constructor(
    private themeService: ThemeService,
    private translateService: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.setCurrentTheme();
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      this.isDarkMode = isDarkMode;
    });
    this.currentLanguage = this.translateService.currentLang;
    this.translateService.onLangChange.subscribe((event: any) => {
      this.currentLanguage = event.lang;
    });
  }

  toggleAccordion(accordionId: string) {
    this.activeAccordion = this.activeAccordion === accordionId ? null : accordionId;
    this.showVideo = this.activeAccordion === 'accordion5';
  }

  setCurrentTheme(): void {
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      if (typeof document !== 'undefined') {
        if (isDarkMode) {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
      }
    });
  }
}

