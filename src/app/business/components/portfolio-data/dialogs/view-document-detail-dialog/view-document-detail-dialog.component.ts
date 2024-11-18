import {Component, Inject} from '@angular/core';
import {PortfolioService} from '../../../../services/portfolio.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {DatePipe, TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-view-document-detail-dialog',
  standalone: true,
  imports: [
    TranslatePipe,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './view-document-detail-dialog.component.html',
  styleUrl: './view-document-detail-dialog.component.css'
})
export class ViewDocumentDetailDialogComponent {

  portfolioId: number | undefined;
  portfolioData: any | undefined;
  userId: number = 1;

  constructor(
    private portfolioService: PortfolioService,
    public dialogRef: MatDialogRef<ViewDocumentDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.portfolioId = data.portfolioId;
    this.portfolioService.getPortfoliosByUserId(this.userId).subscribe(
      response => {
        this.portfolioData = response.find(portfolio => portfolio.id === this.portfolioId);
      }
    );
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

