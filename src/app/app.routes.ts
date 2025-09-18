import { Routes } from '@angular/router';
import {
  HomeComponent,
  LoginComponent,
  RegisterComponent,
  AdminComponent,
  AjoutLivreComponent,
  DetailLivreComponent,
  ProfilComponent,
  ResetPasswordComponent
} from './components';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
    { path: 'ajouter-livre', component: AjoutLivreComponent, canActivate: [AuthGuard] },
    { path: 'detail-livre/:id', component: DetailLivreComponent, canActivate: [AuthGuard] },
    { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '/home' }
];
