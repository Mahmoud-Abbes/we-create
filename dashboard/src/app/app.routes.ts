import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { CreateComponent } from './pages/create/create.component';
import { CreatingComponent } from './pages/creating/creating.component';
import { ViewComponent } from './pages/view/view.component';
import { authRoutesGuard } from './guards/auth.routes.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'create', component: CreateComponent, canActivate: [authRoutesGuard] },
  { path: 'creating', component: CreatingComponent, canActivate: [authRoutesGuard] },
  { path: 'view/:slug', component: ViewComponent, canActivate: [authRoutesGuard]  },
  { path: '**', redirectTo: '' },
];
