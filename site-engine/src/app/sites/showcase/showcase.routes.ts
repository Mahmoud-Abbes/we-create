import { Routes } from '@angular/router';
import { ShowcaseComponent } from './showcase.component';
import { HomePageEngineComponent } from './engine/home-page-engine/home-page-engine.component';
import { ContactPageEngineComponent } from './engine/contact-page-engine/contact-page-engine.component';

export const SHOWCASE_ROUTES: Routes = [
  {
    path: '',
    component: ShowcaseComponent,
    children: [
      { path: '', component: HomePageEngineComponent },
      { path: 'contact', component: ContactPageEngineComponent },
    ],
  },
];