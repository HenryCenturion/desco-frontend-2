import {Component, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {DatePipe, NgForOf, NgIf, TitleCasePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {PortfolioService} from '../../../../services/portfolio.service';
import {MatDialog} from '@angular/material/dialog';
import {
  ViewDocumentDetailDialogComponent
} from '../../dialogs/view-document-detail-dialog/view-document-detail-dialog.component';
import {
  ConfirmDeleteDocumentDialogComponent
} from '../../dialogs/confirm-delete-document-dialog/confirm-delete-document-dialog.component';

@Component({
  selector: 'app-view-portfolio-detail',
  standalone: true,
  imports: [
    TranslatePipe,
    DatePipe,
    TitleCasePipe,
    FormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './view-portfolio-detail.component.html',
  styleUrl: './view-portfolio-detail.component.css'
})
export class ViewPortfolioDetailComponent implements OnInit {
  documents: any[] = [];
  portfolioId: number | undefined;
  portfolioData: any | undefined;
  userId: number = 1;
  showNoDocumentsMessage = false;
  showFilters: boolean = false;
  isSmallScreen = window.innerWidth < 768;
  filters = {
    keyword: '',
    minAmount: null,
    maxAmount: null,
    documentType: '',
    issueDate: null,
    dueDate: null,
    debtorName: ''
  };

  constructor(
    private route: ActivatedRoute,
    private portfolioService: PortfolioService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.onResize.bind(this));
    this.portfolioId = +(this.route.snapshot.paramMap.get('id') ?? 0);
    this.portfolioService.getPortfoliosByUserId(this.userId).subscribe(
      response => {
        this.portfolioData = response.find(portfolio => portfolio.id === this.portfolioId);
      }
    );
    this.getDocuments();
  }

  onResize(): void {
    this.isSmallScreen = window.innerWidth < 768;
    if (!this.isSmallScreen) {
      this.showFilters = true; // Asegura que los filtros estén visibles en pantallas grandes
    }
  }

  getDocuments(): void {
    this.portfolioService.getDocumentsByPortfolioId(this.portfolioId!).subscribe(data => {
      this.documents = data;
    });
  }

  openDocumentDetailDialog(document: any): void {
    this.dialog.open(ViewDocumentDetailDialogComponent, {
      width: '400px',
      data: document
    });
  }

  openCreateDocumentDialog() {
    this.router.navigate([`/portfolio/${this.portfolioId}/add-document`]);
  }

  discountPortfolio() {
    if (this.documents.length === 0) {
      this.showNoDocumentsMessage = true;
    } else {
      this.showNoDocumentsMessage = false;
      this.router.navigate([`/portfolio/${this.portfolioId}/discount-portfolio`]);
    }
  }

  deleteDocument(documentId: number): void {
    this.portfolioService.deleteDocument(documentId).subscribe(() => {
      this.documents = this.documents.filter(doc => doc.id !== documentId);
    });
  }

  onDeleteDocument(documentId: number): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDocumentDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteDocument(documentId);
      }
    });
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  applyFilters(): void {
    this.portfolioService.getDocumentsByPortfolioId(this.portfolioId!).subscribe(data => {
      this.documents = data.filter(doc => {
        const normalizeString = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const matchesKeyword = this.filters.keyword ? normalizeString(doc.concept).includes(normalizeString(this.filters.keyword)) : true;
        const matchesAmount = (this.filters.minAmount ? doc.amount >= this.filters.minAmount : true) &&
          (this.filters.maxAmount ? doc.amount <= this.filters.maxAmount : true);
        const matchesDocumentType = this.filters.documentType ? doc.type === this.filters.documentType : true;
        const matchesIssueDate = this.filters.issueDate ? new Date(doc.issueDate) >= new Date(this.filters.issueDate) : true;
        const matchesDueDate = this.filters.dueDate ? new Date(doc.dueDate) <= new Date(this.filters.dueDate) : true;
        const matchesDebtorName = this.filters.debtorName ? normalizeString(doc.debtorName).includes(normalizeString(this.filters.debtorName)) : true;

        return matchesKeyword && matchesAmount && matchesDocumentType && matchesIssueDate && matchesDueDate && matchesDebtorName;
      });
    });
  }

  clearFilters(): void {
    this.filters = {
      keyword: '',
      minAmount: null,
      maxAmount: null,
      documentType: '',
      issueDate: null,
      dueDate: null,
      debtorName: ''
    };
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
}

