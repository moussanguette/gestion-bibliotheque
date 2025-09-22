import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, AuthCredentials, SignUpCredentials } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {
    this.checkStoredUser();
  }

  private checkStoredUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_data');
  }

  async signUp(credentials: SignUpCredentials): Promise<ApiResponse<User>> {
    try {
      const response = await this.http.post<{ user: User; token: string }>(`${environment.api.baseUrl}/auth/signup`, {
        username: credentials.email, // Utilisation du username comme demandé par votre API
        password: credentials.password,
        name: credentials.name
      }).toPromise();

      if (response?.user && response?.token) {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        return { data: response.user };
      }

      return { error: 'Erreur lors de l\'inscription' };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error: error.error?.message || 'Erreur lors de l\'inscription' };
    }
  }

  async signIn(credentials: AuthCredentials): Promise<ApiResponse<User>> {
    try {
      const response = await this.http.post<{
        id: number;
        username: string;
        email: string;
        roles: string[];
        tokenType: string;
        accessToken: string;
      }>(`${environment.api.baseUrl}/auth/signin`, {
        username: credentials.email, // Utilisation du username comme demandé par votre API
        password: credentials.password
      }).toPromise();

      if (response?.accessToken && response?.id) {
        const user: User = {
          id: response.id.toString(),
          username: response.username,
          email: response.email,
          roles: response.roles
        };

        localStorage.setItem(this.tokenKey, response.accessToken);
        localStorage.setItem('user_data', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return { data: user };
      }

      return { error: 'Identifiants invalides' };
    } catch (error: any) {
      console.error('Signin error:', error);
      return { error: error.error?.message || 'Identifiants invalides' };
    }
  }

  async signOut(): Promise<ApiResponse<boolean>> {
    try {
      const token = this.getStoredToken();
      if (token) {
        // Appel de l'endpoint de déconnexion côté serveur
        await this.http.post(`${environment.api.baseUrl}/auth/signout`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).toPromise();
      }

      this.clearStorage();
      this.currentUserSubject.next(null);
      return { data: true };
    } catch (error) {
      // Même en cas d'erreur serveur, on déconnecte localement
      this.clearStorage();
      this.currentUserSubject.next(null);
      return { data: true };
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.currentUserSubject.value;
    return !!(token && user);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  async getAuthHeaders(): Promise<{ [key: string]: string }> {
    const token = this.getStoredToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
}