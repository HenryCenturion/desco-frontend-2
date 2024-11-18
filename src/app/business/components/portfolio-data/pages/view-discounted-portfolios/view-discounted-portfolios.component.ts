import {Component, HostListener, OnInit} from '@angular/core';
import {PortfolioService} from '../../../../services/portfolio.service';
import {BankService} from '../../../../services/bank.service';
import {DatePipe, DecimalPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-view-discounted-portfolios',
  standalone: true,
  imports: [
    DecimalPipe,
    TranslatePipe,
    NgClass,
    DatePipe,
    NgForOf,
    NgIf
  ],
  templateUrl: './view-discounted-portfolios.component.html',
  styleUrl: './view-discounted-portfolios.component.css'
})
export class ViewDiscountedPortfoliosComponent implements OnInit {
  portfolioId: number | undefined;
  details: any[] = [];
  portfolios: any[] = [];
  documentCounts: { [key: string]: number } = {};
  banks: any[] = [];
  discountDetails: any[] = [];
  isCollapsed: boolean = true;
  collapsedStates: { [key: number]: boolean } = {};
  selectedPortfolio: any | null = null;
  discountData: any = [];
  isBrowser: boolean = typeof window !== 'undefined';
  screenWidth: number = window.innerWidth;

  constructor(private portfolioService: PortfolioService,
              private bankService: BankService) {}

  ngOnInit() {
    if (this.isBrowser) {
      this.screenWidth = window.innerWidth;
    }
    this.loadData();
  }

  exportPortfolioAsPDF(portfolio: any): void {
    const doc = new jsPDF();
    let y = 20; // Posición inicial en el eje Y

    // Cargar y colocar el logo (ajusta la posición y el tamaño según sea necesario)
    const logoPath = 'assets/logo_desco.png'; // Cambia esto por la ruta real de tu logo
    doc.addImage(logoPath, 'PNG', 180, 5, 15, 15); // (x, y, width, height)

    // Título de la cartera
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(`Cartera: ${portfolio.portfolioName}`, 10, y);

    // Nombre de la app "Desco" en la parte superior derecha
    doc.setFontSize(14);
    doc.text('Desco', 180, y + 5); // Ajusta el valor de x e y para posicionar el texto al lado del logo

    y += 10;
    doc.setDrawColor(0, 0, 255);
    doc.line(10, y, 200, y); // Línea decorativa
    y += 10;

    // Sección de detalles generales
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('Detalles generales de la cartera descontada', 10, y);
    y += 8;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y); // Línea separadora
    y += 5;

    // Ajuste del espacio horizontal para las etiquetas y valores
    const labelX = 10; // Posición X para las etiquetas
    const valueX = 80; // Posición X para los valores (más separada)

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');
    const details = [
      { label: 'Banco', value: portfolio.bankName },
      { label: 'Valor nominal total', value: `${portfolio.portfolioCurrency === 'PEN' ? 'S/' : '$'}${portfolio.totalNominalValue.toFixed(2)}` },
      { label: 'Valor de descuento total', value: `${portfolio.portfolioCurrency === 'PEN' ? 'S/' : '$'}${portfolio.totalDiscountValue.toFixed(2)}` },
      { label: 'Valor neto total', value: `${portfolio.portfolioCurrency === 'PEN' ? 'S/' : '$'}${portfolio.totalNetValue.toFixed(2)}` },
      { label: 'TCEA', value: `${(portfolio.portfolioTCEA * 100).toFixed(5)}%` },
      { label: 'Tasa de interés', value: `${(portfolio.interestRate * 100).toFixed(2)}%` },
      { label: 'Tipo de tasa de interés', value: portfolio.interestRateType },
      { label: 'Tiempo de tasa de interés', value: `${portfolio.interestRateTime} meses` },
      { label: 'Frecuencia de capitalización', value: portfolio.capitalizationFrequency },
      { label: 'Fecha de descuento', value: portfolio.discountDate }
    ];

    details.forEach(detail => {
      doc.setFont('Helvetica', 'bold');
      doc.text(`${detail.label}:`, labelX, y);
      doc.setFont('Helvetica', 'normal');
      doc.text(detail.value, valueX, y); // Mostrar el valor con más espacio horizontal
      y += 6; // Incremento mayor para más espacio entre líneas
    });

    // Espacio antes de los documentos
    y += 10;

    // Documentos dentro de la cartera
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Documentos descontados en la cartera', 10, y);
    y += 8;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 5;

    portfolio.details.forEach((detail: { documentId: { concept: any; type: any; }; discountTime: any; discountRate: number; nominalValue: number; discountValue: number; netValue: number; tcea: number; }, index: number) => {
      if (y > 270) { // Si la posición Y excede el límite de la página
        doc.addPage();
        y = 20; // Reiniciar la posición Y en la nueva página
      }

      // Encabezado de cada documento
      doc.setFont('Helvetica', 'bold');
      doc.setFillColor(230, 230, 250); // Color de fondo suave
      doc.rect(10, y, 190, 8, 'F'); // Rectángulo de fondo
      doc.text(`Documento ${index + 1}`, 10, y + 6);
      y += 12; // Espacio más amplio

      // Detalles del documento con más espacio
      const documentDetails = [
        { label: 'Concepto', value: detail.documentId.concept },
        { label: 'Tipo', value: detail.documentId.type },
        { label: 'Días descontados', value: detail.discountTime.toString() },
        { label: 'Tasa descontada', value: `${(detail.discountRate * 100).toFixed(5)}%` },
        { label: 'Valor nominal', value: `${portfolio.portfolioCurrency === 'PEN' ? 'S/' : '$'}${detail.nominalValue.toFixed(2)}` },
        { label: 'Valor descontado', value: `${portfolio.portfolioCurrency === 'PEN' ? 'S/' : '$'}${detail.discountValue.toFixed(2)}` },
        { label: 'Valor neto', value: `${portfolio.portfolioCurrency === 'PEN' ? 'S/' : '$'}${detail.netValue.toFixed(2)}` },
        { label: 'TCEA', value: `${(detail.tcea * 100).toFixed(5)}%` }
      ];

      documentDetails.forEach(docDetail => {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`${docDetail.label}:`, labelX, y);
        doc.setFont('Helvetica', 'normal');
        doc.text(docDetail.value, valueX, y);
        y += 5; // Incremento de espacio entre líneas de detalles
      });
      y += 2; // Espacio adicional entre documentos
    });

    // Guardar el archivo PDF
    doc.save(`${portfolio.portfolioName}_detalles_descuento.pdf`);
  }








  // Usar @HostListener solo si estamos en un entorno de navegador
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (this.isBrowser) {
      this.screenWidth = (event.target as Window).innerWidth;
    }
  }
  closeDocuments(): void {
    this.selectedPortfolio = null;
  }

  loadData(): void {
    this.getAllBanks()
      .then(() => this.getAllDiscountedDetails())
      .catch(error => console.error(error));
  }

  getAllDiscountedDetails(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.portfolioService.getAllDiscountedDetails().subscribe(
        data => {
          this.discountData = data;
          this.portfolios = data.reduce((acc, detail) => {
            const portfolioId = detail.documentId.portfolioId.id;
            const portfolioName = detail.documentId.portfolioId.name;
            const portfolioCurrency = detail.documentId.portfolioId.currency;
            const portfolioTCEA = detail.documentId.portfolioId.tcea;
            const documentType = detail.documentId.type;
            const bankName = detail.bankId.name;
            const interestRate = detail.interestRate;
            const interestRateType = detail.interestRateType;
            const interestRateTime = detail.interestRateTime;
            const capitalizationFrequency = detail.capitalizationFrequency;
            const discountDate = detail.discountDate;

            if (!acc[portfolioId]) {
              acc[portfolioId] = {
                portfolioId: portfolioId,
                portfolioName: portfolioName,
                bankName: bankName,
                portfolioCurrency: portfolioCurrency,
                portfolioTCEA: portfolioTCEA,
                documentType: documentType,
                interestRate: interestRate,
                interestRateType: interestRateType,
                interestRateTime: interestRateTime,
                capitalizationFrequency: capitalizationFrequency,
                discountDate: discountDate,
                details: [],
                totalNominalValue: 0,
                totalDiscountValue: 0,
                totalNetValue: 0
              };
              this.collapsedStates[portfolioId] = true;
            }
            acc[portfolioId].details.push(detail);
            acc[portfolioId].totalNominalValue += detail.nominalValue;
            acc[portfolioId].totalDiscountValue += detail.discountValue;
            acc[portfolioId].totalNetValue += detail.netValue;
            return acc;
          }, {});
          this.portfolios = Object.values(this.portfolios);
          console.log(this.portfolios);
          resolve();
        },
        error => reject(error)
      );
    });
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

  toggleCollapse(portfolioId: number): void {
    this.collapsedStates[portfolioId] = !this.collapsedStates[portfolioId];
  }

  selectPortfolio(portfolio: any): void {
    if (this.selectedPortfolio === portfolio) {
      this.selectedPortfolio = null;
    } else {
      this.selectedPortfolio = portfolio;
    }
  }
}

