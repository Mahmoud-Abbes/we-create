import { Routes } from '@angular/router';
import { SiteRendererComponent } from './site-renderer/site-renderer.component';

export const routes: Routes = [
  { path: ':slug', component: SiteRendererComponent },
];
