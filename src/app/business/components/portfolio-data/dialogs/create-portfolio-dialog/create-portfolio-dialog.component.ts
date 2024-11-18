import { Component } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {PortfolioService} from '../../../../services/portfolio.service';
import {TranslatePipe} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-create-portfolio-dialog',
  standalone: true,
  imports: [
    TranslatePipe,
    FormsModule,
    NgIf
  ],
  templateUrl: './create-portfolio-dialog.component.html',
  styleUrl: './create-portfolio-dialog.component.css'
})
export class CreatePortfolioDialogComponent {
  portfolioName: string = '';
  isDollar = false;
  isSubmitted: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<CreatePortfolioDialogComponent>,
    private portfolioService: PortfolioService
  ) {}

  toggleCurrency(): void {
    this.isDollar = !this.isDollar;
  }

  onCreate(): void {
    this.isSubmitted = true;
    if (this.portfolioName.trim()) {
      const newPortfolio = {
        userId: 1,
        name: this.portfolioName,
        currency: this.isDollar ? 'USD' : 'PEN',
        totalValue: 0,
        createdAt: new Date().toISOString(),
        state: 'active'
      };

      console.log('Creating portfolio:', newPortfolio);

      this.portfolioService.createPortfolio(newPortfolio).subscribe(
        response => {
          this.dialogRef.close(response);
          window.location.reload();
        },
        error => {
        }
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

