import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Register } from './register/register';
import { Livre } from './livre/livre';
import { Admin } from './admin/admin';
import { ListeLivre } from './liste-livre/liste-livre';
import { AjouterLivre } from './ajouter-livre/ajouter-livre';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'livre', component: Livre },
    { path: 'admin', component: Admin },
    { path: 'liste-livre', component: ListeLivre },
    { path: 'ajouter-livre', component: AjouterLivre },

];
