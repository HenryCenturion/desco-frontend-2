import {Component, OnInit} from '@angular/core';
import {BankService} from '../../../services/bank.service';
import {ThemeService} from '../../../../shared/services/theme.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {NgForOf, NgIf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-banks',
  standalone: true,
  imports: [
    TranslatePipe,
    NgStyle,
    NgForOf,
    NgIf
  ],
  templateUrl: './banks.component.html',
  styleUrl: './banks.component.css'
})
export class BanksComponent implements OnInit {
  banks: any[] = [];
  isDarkMode: boolean = false;
  currentLanguage: string | undefined;

  constructor(private bankService: BankService,
              private themeService: ThemeService,
              private translateService: TranslateService,) {
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
    this.bankService.getAllBanks().subscribe(data => {
      console.log(data);
      this.banks = data;
    });
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


