import { Injectable } from '@angular/core';
import {environment} from '../../../environment/environment';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {map, Observable, tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient,
              private route: Router) { }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/users/login`, { email, password }, { observe: 'response' })
      .pipe(
        tap(response => {
          if (response.status === 200 && response.body?.token) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('authToken', response.body.token);
          }
        }),
        map(response => response.status === 200)
      );
  }

  logout(): void {
    if(typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('authToken');
    }
    this.route.navigate(['/sign-in']);
  }

  isUserLoggedIn(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('isLoggedIn') === 'true';
    }
    return false;
  }
}
