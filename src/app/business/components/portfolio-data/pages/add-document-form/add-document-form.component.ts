import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {PortfolioService} from '../../../../services/portfolio.service';
import {ThemeService} from '../../../../../shared/services/theme.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-add-document-form',
  standalone: true,
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './add-document-form.component.html',
  styleUrl: './add-document-form.component.css'
})
export class AddDocumentFormComponent implements OnInit {
  documentForm: FormGroup;
  portfolioData: any | undefined;
  portfolioId: number | undefined;
  userId: number = 1;
  isDarkMode: boolean = false;
  currentLanguage: string | undefined;

  constructor(private fb: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private portfolioService: PortfolioService,
              private themeService: ThemeService,
              private translateService: TranslateService,) {
    this.portfolioId = +(this.route.snapshot.paramMap.get('portfolioId') ?? 0);
    this.portfolioData = [];
    this.documentForm = this.fb.group({
      portfolioId: [this.portfolioId, Validators.required],
      type: ['factura', Validators.required],
      concept: ['', Validators.required],
      debtorName: ['', [Validators.required, this.alphabeticValidator]],
      debtorDni: ['', [Validators.required, Validators.pattern(/^\d{8}$|^\d{11}$/)]],
      issueDate: ['', [Validators.required, this.notFutureDateValidator]],
      dueDate: ['', [Validators.required, this.notPastOrTodayDateValidator]],
      amount: ['', [Validators.required, this.positiveValueValidator, this.numericValidator]],
    });
  }

  ngOnInit(): void {
    this.portfolioId = +(this.route.snapshot.paramMap.get('portfolioId') ?? 0);
    this.setCurrentTheme();
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      this.isDarkMode = isDarkMode;
    });
    this.currentLanguage = this.translateService.currentLang;
    this.translateService.onLangChange.subscribe((event: any) => {
      this.currentLanguage = event.lang;
    });
    this.portfolioService.getPortfoliosByUserId(this.userId).subscribe(
      response => {
        this.portfolioData = response.find(portfolio => portfolio.id === this.portfolioId);
      }
    );
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

  onSubmit() {
    if (this.documentForm.valid) {
      this.portfolioService.addDocument(this.documentForm.value).subscribe(
        response => {
          this.router.navigate([`/portfolio/${this.portfolioId}`]);
        }
      );
    } else {
      this.documentForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate([`/portfolio/${this.portfolioId}`]);
  }


  notFutureDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const today = new Date();
    const selectedDate = new Date(control.value);
    if (selectedDate > today) {
      return { 'notFutureDate': true };
    }
    return null;
  }

  notPastOrTodayDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(control.value);
    if (selectedDate <= today) {
      return { 'notPastOrTodayDate': true };
    }
    return null;
  }


  positiveValueValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value !== null && control.value <= 0) {
      return { 'positiveValue': true };
    }
    return null;
  }

  numericValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const regex = /^[0-9]+$/;
    if (control.value && !regex.test(control.value)) {
      return { 'numeric': true };
    }
    return null;
  }

  alphabeticValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const regex = /^[A-Za-z\s]+$/;
    if (control.value && !regex.test(control.value)) {
      return { 'alphabetic': true };
    }
    return null;
  }
}

