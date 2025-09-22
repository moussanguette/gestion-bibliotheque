import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthCredentials, SignUpCredentials } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSignUpMode = false;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  formData = {
    email: '', // Sera utilisé comme username dans l'API
    password: '',
    name: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMode() {
    this.isSignUpMode = !this.isSignUpMode;
    this.errorMessage = '';
    this.formData = { email: '', password: '', name: '' };
  }

  async handleSubmit() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      if (this.isSignUpMode) {
        await this.handleSignUp();
      } else {
        await this.handleLogin();
      }
    } catch (error) {
      this.errorMessage = 'Une erreur inattendue s\'est produite';
    } finally {
      this.isLoading = false;
    }
  }

  private async handleLogin() {
    const credentials: AuthCredentials = {
      email: this.formData.email,
      password: this.formData.password
    };

    const result = await this.authService.signIn(credentials);

    if (result.error) {
      this.errorMessage = result.error;
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private async handleSignUp() {
    const credentials: SignUpCredentials = {
      email: this.formData.email,
      password: this.formData.password,
      name: this.formData.name
    };

    const result = await this.authService.signUp(credentials);

    if (result.error) {
      this.errorMessage = result.error;
    } else {
      // Auto-login after successful signup
      await this.handleLogin();
    }
  }
}