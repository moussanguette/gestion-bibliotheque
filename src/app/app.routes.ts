import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Register } from './register/register';
import { Livre } from './livre/livre';
import { Admin } from './admin/admin';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'livre', component: Livre },
    { path: 'adlin', component: Admin },

];
