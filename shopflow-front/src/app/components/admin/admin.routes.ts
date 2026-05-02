import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  }
  // TODO: Ajouter les autres routes quand les composants seront créés
  // {
  //   path: 'users',
  //   loadComponent: () => import('./users/admin-users.component').then(m => m.AdminUsersComponent)
  // },
  // {
  //   path: 'products',
  //   loadComponent: () => import('./products/admin-products.component').then(m => m.AdminProductsComponent)
  // },
  // {
  //   path: 'orders',
  //   loadComponent: () => import('./orders/admin-orders.component').then(m => m.AdminOrdersComponent)
  // },
  // {
  //   path: 'categories',
  //   loadComponent: () => import('./categories/admin-categories.component').then(m => m.AdminCategoriesComponent)
  // },
  // {
  //   path: 'coupons',
  //   loadComponent: () => import('./coupons/admin-coupons.component').then(m => m.AdminCouponsComponent)
  // }
];