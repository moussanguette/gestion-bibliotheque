import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip authentication for login and signup requests
    if (req.url.includes('/auth/signin') || req.url.includes('/auth/signup') || req.url.includes('/auth/create-demo-accounts')) {
      return next.handle(req);
    }

    // Get the token from the auth service
    const token = localStorage.getItem('auth_token');

    if (token) {
      // Clone the request and add the Authorization header
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });

      console.log('🔐 Adding auth token to request:', req.url);
      return next.handle(authReq);
    }

    // If no token, proceed with the original request
    return next.handle(req);
  }
}