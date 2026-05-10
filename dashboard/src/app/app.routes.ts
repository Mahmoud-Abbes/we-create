import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { CreateComponent } from './pages/create/create.component';
import { CreatingComponent } from './pages/creating/creating.component';
import { ViewComponent } from './pages/view/view.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'create', component: CreateComponent },
  { path: 'creating', component: CreatingComponent },
  { path: 'view/:projectId', component: ViewComponent },
  { path: '**', redirectTo: '' },
];
