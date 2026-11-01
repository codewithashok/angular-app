import { Routes } from '@angular/router';
import { MainLayout } from '@core/layout/main-layout/main-layout';

export const routes: Routes = [
  {
    // Every page inside `children` renders within MainLayout's <router-outlet>.
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        title: 'Home',
        // Lazy loaded: the page's code downloads only when the route is visited.
        loadComponent: () => import('@features/home/home').then((m) => m.Home),
      },
      {
        path: '**',
        title: 'Page not found',
        loadComponent: () => import('@features/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
