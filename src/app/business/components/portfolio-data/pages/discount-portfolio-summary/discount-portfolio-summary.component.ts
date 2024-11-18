import {Component, OnInit} from '@angular/core';
import {BankService} from '../../../../services/bank.service';
import {PortfolioService} from '../../../../services/portfolio.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {catchError, map, Observable, of} from 'rxjs';
import {differenceInCalendarDays, parseISO} from 'date-fns';
import {DecimalPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {
  CancelDiscountPortfolioDialogComponent
} from '../../dialogs/cancel-discount-portfolio-dialog/cancel-discount-portfolio-dialog.component';
import {
  ConfirmDiscountPortfolioDialogComponent
} from '../../dialogs/confirm-discount-portfolio-dialog/confirm-discount-portfolio-dialog.component';

@Component({
  selector: 'app-discount-portfolio-summary',
  standalone: true,
  imports: [
    DecimalPipe,
    TranslatePipe,
    NgClass,
    FormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './discount-portfolio-summary.component.html',
  styleUrl: './discount-portfolio-summary.component.css'
})
export class DiscountPortfolioSummaryComponent implements OnInit {
  portfolioId: number | undefined;
  currency: string | null = null;
  banks: any[] = [];
  documents: any[] = [];
  documentCounts: { [key: string]: number } = {};
  isCollapsed: boolean = true;
  netValuesByBank: { [bankId: number]: number } = {};
  selectedBankId: number | undefined;
  showError: boolean = false;

  constructor(private bankService: BankService,
              private portfolioService: PortfolioService,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog) {}

  ngOnInit(): void {
    this.portfolioId = +(this.route.snapshot.paramMap.get('portfolioId') ?? 0);
    this.loadData();
    this.getPortfoliosByUserId(1).subscribe(currency => {
      this.currency = currency;
    });
  }

  loadData(): void {
    Promise.all([this.getAllBanks(), this.getDocuments()])
  }

  getPortfoliosByUserId(userId: number): Observable<string | null> {
    return this.portfolioService.getPortfoliosByUserId(userId).pipe(
      map(data => {
        const portfolio = data.find(portfolio => portfolio.id === this.portfolioId);
        console.log('Portafolio filtrado:', portfolio);
        return portfolio ? portfolio.currency : null;
      }),
      catchError(error => {
        //console.error('Error al obtener los portafolios:', error);
        return of(null);
      })
    );
  }

  getAllBanks(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.bankService.getAllBanks().subscribe(
        (data: any[]) => {
          this.banks = data;
          resolve();
        },
        error => reject(error)
      );
    });
  }

  getInterestRate(bankId: number): string {
    const bank = this.banks.find(b => b.id === bankId);
    return bank ? bank.interestRate : '';
  }

  getInterestRateType(bankId: number): string {
    const bank = this.banks.find(b => b.id === bankId);
    return bank ? bank.interestRateType : '';
  }

  getInterestRateTime(bankId: number): string {
    const bank = this.banks.find(b => b.id === bankId);
    return bank ? bank.interestRateTime : '';
  }

  getCapitalizationFrequency(bankId: number): string {
    const bank = this.banks.find(b => b.id === bankId);
    return bank ? bank.capitalizationFrequency : '';
  }


  confirmDiscount(): void {

    if (!this.selectedBankId) {
      this.showError = true;
      return;
    } else {
      const dialogRef = this.dialog.open(ConfirmDiscountPortfolioDialogComponent);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (!this.selectedBankId) {
            this.showError = true;
            return;
          }

          this.showError = false;
          const portfolioData = {
            portfolioId: this.portfolioId,
            bankId: this.selectedBankId
          };
          //console.log('Datos de la cartera a descontar:', portfolioData);

          this.portfolioService.confirmDiscount(portfolioData).subscribe(
            response => {
              //console.log('Descuento confirmado:', response);
            },
            error => {
              //console.error('Error al confirmar el descuento:', error);
            }
          );
        }
      });
    }
  }

  countDocumentsByType(): void {
    this.documentCounts = this.documents.reduce((counts, document) => {
      counts[document.type] = (counts[document.type] || 0) + 1;
      return counts;
    }, {});
  }

  cancelDiscount(): void {
    const dialogRef = this.dialog.open(CancelDiscountPortfolioDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate([`/portfolio/${this.portfolioId}`]);
      }
    });
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  getDocuments(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.portfolioService.getDocumentsByPortfolioId(this.portfolioId!).subscribe(
        data => {
          this.documents = data.map(document => {
            const daysDiff = this.calculateTimeToDiscount(document.dueDate);
            const discountRatesByBank: { [bankId: number]: number } = {};
            const netValuesByBank: { [bankId: number]: number } = {};

            this.banks.forEach(bank => {
              const knownDays = interestRateTimeToDays[bank.interestRateTime];
              const capitalizationDays = interestRateTimeToDays[bank.capitalizationFrequency];

              let effectiveRate = 0;
              if (bank.interestRateType === 'efectiva') {
                if (knownDays) {
                  effectiveRate = this.convertEffectiveRateToEffectiveRate(bank.interestRate / 100, knownDays, daysDiff);
                }
              } else if (bank.interestRateType === 'nominal') {
                if (knownDays && capitalizationDays) {
                  effectiveRate = this.convertNominalRateToEffectiveRate(bank.interestRate / 100, knownDays, capitalizationDays, daysDiff);
                }
              }

              const discountRate = this.convertEffectiveRateToDiscountRate(effectiveRate);
              discountRatesByBank[bank.id] = discountRate;
              netValuesByBank[bank.id] = document.amount * (1 - discountRate);
            });

            return {
              ...document,
              daysToDue: daysDiff,
              discountRatesByBank: discountRatesByBank,
              netValuesByBank: netValuesByBank
            };
          });
          this.countDocumentsByType();
          //console.log('Documentos:', this.documents);
          resolve();
        },
        error => reject(error)
      );
    });
  }

  calculateTimeToDiscount(dueDate: string): number {
    const due = parseISO(dueDate);
    const current = new Date();
    return differenceInCalendarDays(due, current);
  }

  convertNominalRateToEffectiveRate(nominalRate: number, nominalDays: number, capitalizationDays: number, effectiveDays: number): number {
    const m = nominalDays / capitalizationDays;
    const n = effectiveDays / capitalizationDays;
    return Math.pow(1 + (nominalRate / m), n) - 1;
  }

  convertEffectiveRateToEffectiveRate(knownRate: number, knownDays: number, targetDays: number): number {
    if(targetDays === knownDays) {
      return knownRate;
    }
    return Math.pow(1 + knownRate, targetDays / knownDays) - 1;
  }

  convertEffectiveRateToDiscountRate(effectiveRate: number): number {
    return effectiveRate / (1 + effectiveRate);
  }

  updateDocumentValues(): void {
    this.selectedBankId = Number(this.selectedBankId);
  }

  getTotalNetValue(): number {
    if (!this.selectedBankId) return 0;
    return this.documents.reduce((total, document) => {
      return total + (document.netValuesByBank[this.selectedBankId!] || 0);
    }, 0);
  }

  getTotalNominalValue(): number {
    return this.documents.reduce((sum, document) => sum + document.amount, 0);
  }

  getTotalDiscountValue(): number {
    return this.documents.reduce((sum, document) => sum + document.amount * document.discountRatesByBank[this.selectedBankId!], 0);
  }
}

const interestRateTimeToDays: { [key: string]: number } = {
  'diaria': 1,
  'quincenal': 15,
  'mensual': 30,
  'bimestral': 60,
  'trimestral': 90,
  'cuatrimestral': 120,
  'semestral': 180,
  'anual': 360
}

