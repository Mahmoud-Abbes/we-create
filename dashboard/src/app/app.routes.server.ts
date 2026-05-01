import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '', // The Landing Page
    //renderMode: RenderMode.Prerender // Speed: Build the landing page at compile time
    renderMode: RenderMode.Server
  },
  {
    path: '**', // All other pages (Dashboard, Auth)
    renderMode: RenderMode.Client // Force Browser-only (CSR)
  }
];
