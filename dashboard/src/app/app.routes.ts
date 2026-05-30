import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { CreateComponent } from './pages/create/create.component';
import { CreatingComponent } from './pages/creating/creating.component';
import { ViewComponent } from './pages/view/view.component';
import { authRoutesGuard } from './guards/auth.routes.guard';
import { BillingComponent } from './pages/billing/billing.component';
import { AccountSettingsComponent } from './pages/account-settings/account-settings.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'create', component: CreateComponent, canActivate: [authRoutesGuard] },
  { path: 'creating', component: CreatingComponent, canActivate: [authRoutesGuard] },
  { path: 'view/:slug', component: ViewComponent, canActivate: [authRoutesGuard]  },
  { path: 'billing/:slug', component: BillingComponent, canActivate: [authRoutesGuard] },
  { path: 'account-settings', component: AccountSettingsComponent, canActivate: [authRoutesGuard] },
  { path: '**', redirectTo: '' },
];
