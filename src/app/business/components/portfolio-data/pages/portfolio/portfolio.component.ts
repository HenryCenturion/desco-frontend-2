import {Component, OnInit} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {PortfolioService} from '../../../../services/portfolio.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {ThemeService} from '../../../../../shared/services/theme.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {CreatePortfolioDialogComponent} from '../../dialogs/create-portfolio-dialog/create-portfolio-dialog.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    TranslatePipe,
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent implements OnInit {
  portfolios: any[] = [];
  filteredPortfolios: any[] = [];
  documentCounts: { [key: number]: number } = {};
  showFilters: boolean = false;
  isSmallScreen = window.innerWidth < 768;
  filters = {
    keyword: '',
    minTotalValue: null,
    maxTotalValue: null,
    minDocuments: null,
    maxDocuments: null
  };
  isDarkMode: boolean = false;
  currentLanguage: string | undefined;

  constructor(
    private portfolioService: PortfolioService,
    private router: Router,
    private dialog: MatDialog,
    private themeService: ThemeService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    const userId = 1;
    if (typeof window !== 'undefined') {
      this.isSmallScreen = window.innerWidth < 768;
      window.addEventListener('resize', this.onResize.bind(this));
    }
    this.setCurrentTheme();
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      this.isDarkMode = isDarkMode;
    });
    this.currentLanguage = this.translateService.currentLang;
    this.translateService.onLangChange.subscribe((event: any) => {
      this.currentLanguage = event.lang;
    });
    this.portfolioService.getPortfoliosByUserId(userId).subscribe(data => {
      this.portfolios = data;
      console.log(data);
      this.filteredPortfolios = data;
      this.portfolios.forEach(portfolio => {
        this.portfolioService.getDocumentsByPortfolioId(portfolio.id).subscribe(docs => {
          this.documentCounts[portfolio.id] = docs.length;
        });
      });
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

  onResize(): void {
    this.isSmallScreen = window.innerWidth < 768;
    if (!this.isSmallScreen) {
      this.showFilters = true;
    }
  }

  openCreatePortfolioDialog(): void {
    this.dialog.open(CreatePortfolioDialogComponent, {
      width: '400px'
    });
  }

  viewPortfolioDetail(portfolioId: number): void {
    this.router.navigate([`/portfolio/${portfolioId}`]);
  }


  applyFilters(): void {
    this.filteredPortfolios = this.portfolios.filter(portfolio => {
      const keywordMatch = this.filters.keyword === '' || portfolio.name.toLowerCase().includes(this.filters.keyword.toLowerCase());
      const totalValueMatch = (!this.filters.minTotalValue || portfolio.totalValue >= this.filters.minTotalValue) &&
        (!this.filters.maxTotalValue || portfolio.totalValue <= this.filters.maxTotalValue);
      const documentCount = this.documentCounts[portfolio.id] || 0;
      const documentCountMatch = (!this.filters.minDocuments || documentCount >= this.filters.minDocuments) &&
        (!this.filters.maxDocuments || documentCount <= this.filters.maxDocuments);

      return keywordMatch && totalValueMatch && documentCountMatch;
    });
  }

  clearFilters(): void {
    this.filters = {
      keyword: '',
      minTotalValue: null,
      maxTotalValue: null,
      minDocuments: null,
      maxDocuments: null
    };
    this.applyFilters();
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatCurrency(value: string): string {
    return value === 'PEN' ? 'Soles' : 'Dolares';
  }

  viewDiscountedPortfolios(): void {
    this.router.navigate(['/discounted-portfolio']);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
}

