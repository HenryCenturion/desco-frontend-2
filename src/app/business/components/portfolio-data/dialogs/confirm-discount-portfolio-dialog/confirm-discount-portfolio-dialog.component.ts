import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-discount-portfolio-dialog',
  standalone: true,
  imports: [
    TranslatePipe
  ],
  templateUrl: './confirm-discount-portfolio-dialog.component.html',
  styleUrl: './confirm-discount-portfolio-dialog.component.css'
})
export class ConfirmDiscountPortfolioDialogComponent {
  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ConfirmDiscountPortfolioDialogComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true);
    this.router.navigate([`/discounted-portfolio`]);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
