import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LoginCredentials, AuthError } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  loginError: string = '';

  // Validation errors
  usernameError: string = '';
  passwordError: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  validateUsername(): boolean {
    this.usernameError = '';

    if (!this.username) {
      this.usernameError = 'Le nom d\'utilisateur est obligatoire';
      return false;
    }

    return true;
  }

  validatePassword(): boolean {
    this.passwordError = '';

    if (!this.password) {
      this.passwordError = 'Le mot de passe est requis';
      return false;
    }

    if (this.password.length < 6) {
      this.passwordError = 'Le mot de passe doit contenir au moins 6 caractères';
      return false;
    }

    return true;
  }

  clearErrors() {
    this.loginError = '';
    this.usernameError = '';
    this.passwordError = '';
  }

  onLogin() {
    this.clearErrors();

    const isUsernameValid = this.validateUsername();
    const isPasswordValid = this.validatePassword();

    if (!isUsernameValid || !isPasswordValid) {
      return;
    }

    this.isLoading = true;

    const credentials: LoginCredentials = {
      username: this.username,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.router.navigate(['/home']);
      },
      error: (error: AuthError) => {
        this.handleLoginError(error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }


  private handleLoginError(error: AuthError) {
    console.error('Login error:', error);
    this.loginError = error.message;
  }

  onUsernameInput() {
    if (this.usernameError) {
      this.validateUsername();
    }
  }

  onPasswordInput() {
    if (this.passwordError) {
      this.validatePassword();
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  navigateToSignup() {
    this.router.navigate(['/register']);
  }

  forgotPassword() {
    this.router.navigate(['/reset-password']);
  }
}
