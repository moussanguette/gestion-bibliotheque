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
  activeTab: 'login' | 'signup' = 'login';

  // Login form
  loginIdentifier = '';
  loginPassword = '';
  showLoginPassword = false;

  // Signup form
  signupUsername = '';
  signupEmail = '';
  signupPassword = '';
  nom = '';
  prenom = '';
  telephone = '';
  adresse = '';
  showSignupPassword = false;

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  setActiveTab(tab: 'login' | 'signup') {
    this.activeTab = tab;
    this.errorMessage = '';
    this.clearForms();
  }

  clearForms() {
    this.loginIdentifier = '';
    this.loginPassword = '';
    this.signupUsername = '';
    this.signupEmail = '';
    this.signupPassword = '';
    this.nom = '';
    this.prenom = '';
    this.telephone = '';
    this.adresse = '';
  }

  useDefaultCredentials() {
    this.loginIdentifier = 'user@default.fr';
    this.loginPassword = 'user123';
  }

  async handleLoginSubmit() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Determine if identifier is email or username
      const isEmail = this.loginIdentifier.includes('@');
      const credentials: AuthCredentials = {
        ...(isEmail ? { email: this.loginIdentifier } : { username: this.loginIdentifier }),
        password: this.loginPassword
      };

      const result = await this.authService.signIn(credentials);

      if (result.error) {
        this.errorMessage = result.error;
      } else {
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      this.errorMessage = 'Une erreur inattendue s\'est produite lors de la connexion';
    } finally {
      this.isLoading = false;
    }
  }

  async handleSignupSubmit() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const credentials: SignUpCredentials = {
        email: this.signupEmail,
        password: this.signupPassword,
        username: this.signupUsername,
        nom: this.nom,
        prenom: this.prenom,
        telephone: this.telephone,
        adresse: this.adresse,
        role: 'ROLE_LECTEUR',
        membershipType: 'Standard',
        booksEmpruntes: 0,
        memberSince: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

      const result = await this.authService.signUp(credentials);

      if (result.error) {
        this.errorMessage = result.error;
      } else {
        // Auto-login after successful signup
        this.loginIdentifier = this.signupEmail;
        this.loginPassword = this.signupPassword;
        await this.handleLoginSubmit();
      }
    } catch (error) {
      this.errorMessage = 'Une erreur inattendue s\'est produite lors de l\'inscription';
    } finally {
      this.isLoading = false;
    }
  }

  async initializeDefaultData() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // This would typically call a service method to initialize default data
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.useDefaultCredentials();

      // You could add actual default data initialization logic here
      console.log('Default data initialized');

    } catch (error) {
      this.errorMessage = 'Erreur lors de l\'initialisation des données par défaut';
    } finally {
      this.isLoading = false;
    }
  }

  // Renseigne automatiquement les identifiants du manager
  useManagerCredentials() {
    this.loginIdentifier = 'manager@bibliotheque.fr';
    this.loginPassword = 'manager123';
  }

  // Initialise des comptes de démo côté API puis prépare les identifiants manager
  async initializeManagerData() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.authService.createDemoAccounts();
      if (result.error) {
        this.errorMessage = result.error;
      }
      // Dans tous les cas, pré-remplir les identifiants manager
      this.useManagerCredentials();
    } catch (error) {
      this.errorMessage = 'Erreur lors de l\'initialisation des données manager';
    } finally {
      this.isLoading = false;
    }
  }
}