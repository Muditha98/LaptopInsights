import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/catalog',
    pathMatch: 'full'
  },
  {
    path: 'catalog',
    loadComponent: () => import('./components/product-catalog/product-catalog.component')
      .then(m => m.ProductCatalogComponent),
    title: 'Product Catalog - Laptop Insights'
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./components/product-details/product-details.component')
      .then(m => m.ProductDetailsComponent),
    title: 'Product Details - Laptop Insights'
  },
  {
    path: 'analytics',
    loadComponent: () => import('./components/analytics/analytics-dashboard.component')
      .then(m => m.AnalyticsDashboardComponent),
    title: 'Analytics - Laptop Insights'
  },
  {
    path: '**',
    redirectTo: '/catalog'
  }
];
