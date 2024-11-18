import { Injectable } from '@angular/core';
import {environment} from '../../../environment/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getPortfoliosByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/portfolios?userId=${userId}`);
  }

  createPortfolio(portfolio: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/portfolios`, portfolio);
  }

  getDocumentsByPortfolioId(portfolioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/documents?portfolioId=${portfolioId}`);
  }

  addDocument(document: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/documents`, document);
  }

  deleteDocument(documentId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/documents/${documentId}`);
  }

  confirmDiscount(portfolioData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/portfolios/confirm-discount`, portfolioData);
  }

  getAllDiscountedDetails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/portfolios/discounted`);
  }
}

