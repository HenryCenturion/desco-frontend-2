import { Component } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-delete-document-dialog',
  standalone: true,
  imports: [
    TranslatePipe
  ],
  templateUrl: './confirm-delete-document-dialog.component.html',
  styleUrl: './confirm-delete-document-dialog.component.css'
})
export class ConfirmDeleteDocumentDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDeleteDocumentDialogComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
