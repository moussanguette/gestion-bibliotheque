import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: any;
  message?: string;
}

export interface AuthError {
  code: string;
  message: string;
  status?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const token = this.getToken();
    if (token) {
      const user = this.getUserFromToken(token);
      this.currentUserSubject.next(user);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  private getUserFromToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.apiService.signin(credentials).pipe(
      tap((response: AuthResponse) => {
        if (response.token) {
          this.setToken(response.token);
          if (response.user) {
            this.setUser(response.user);
          }
        }
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  register(userData: SignupData): Observable<AuthResponse> {
    return this.apiService.signup(userData).pipe(
      tap((response: AuthResponse) => {
        if (response.token) {
          this.setToken(response.token);
          if (response.user) {
            this.setUser(response.user);
          }
        }
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  logout(): Observable<any> {
    return this.apiService.signout().pipe(
      tap(() => {
        this.removeToken();
        this.router.navigate(['/login']);
      }),
      catchError((error) => {
        this.removeToken();
        this.router.navigate(['/login']);
        return throwError(error);
      })
    );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        this.removeToken();
        return false;
      }

      return true;
    } catch (error) {
      this.removeToken();
      return false;
    }
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  private handleAuthError(error: any): Observable<never> {
    let authError: AuthError;

    if (error.status === 0) {
      authError = {
        code: 'NETWORK_ERROR',
        message: 'Problème de connexion. Vérifiez votre connexion internet.'
      };
    } else if (error.status === 401) {
      authError = {
        code: 'INVALID_CREDENTIALS',
        message: 'Email ou mot de passe incorrect.'
      };
    } else if (error.status === 403) {
      authError = {
        code: 'USER_BLOCKED',
        message: 'Votre compte a été bloqué. Contactez l\'administrateur.'
      };
    } else if (error.status === 404) {
      authError = {
        code: 'USER_NOT_FOUND',
        message: 'Aucun utilisateur trouvé avec cet email.'
      };
    } else if (error.status === 409) {
      authError = {
        code: 'EMAIL_EXISTS',
        message: 'Un compte existe déjà avec cet email.'
      };
    } else if (error.status >= 500) {
      authError = {
        code: 'SERVER_ERROR',
        message: 'Erreur du serveur. Veuillez réessayer plus tard.'
      };
    } else {
      authError = {
        code: 'UNKNOWN_ERROR',
        message: error.error?.message || 'Une erreur inattendue s\'est produite.'
      };
    }

    authError.status = error.status;
    return throwError(authError);
  }
}


