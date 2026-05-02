import { Routes } from '@angular/router';

export const sellerRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/seller-dashboard.component').then(m => m.SellerDashboardComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./products/seller-products.component').then(m => m.SellerProductsComponent)
  }
  // TODO: Ajouter les autres routes quand les composants seront créés
  // {
  //   path: 'products/new',
  //   loadComponent: () => import('./products/product-form/product-form.component').then(m => m.ProductFormComponent)
  // },
  // {
  //   path: 'products/:id/edit',
  //   loadComponent: () => import('./products/product-form/product-form.component').then(m => m.ProductFormComponent)
  // },
  // {
  //   path: 'orders',
  //   loadComponent: () => import('./orders/seller-orders.component').then(m => m.SellerOrdersComponent)
  // },
  // {
  //   path: 'profile',
  //   loadComponent: () => import('./profile/seller-profile.component').then(m => m.SellerProfileComponent)
  // }
];