import { Component } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-cancel-discount-portfolio-dialog',
  standalone: true,
  imports: [
    TranslatePipe
  ],
  templateUrl: './cancel-discount-portfolio-dialog.component.html',
  styleUrl: './cancel-discount-portfolio-dialog.component.css'
})
export class CancelDiscountPortfolioDialogComponent {
  constructor(public dialogRef: MatDialogRef<CancelDiscountPortfolioDialogComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
