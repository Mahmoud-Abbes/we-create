import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { CreateComponent } from './pages/create/create.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'create', component: CreateComponent },
  { path: '**', redirectTo: '' }, // Good practice: redirect unknown paths to home
];
