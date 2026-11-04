import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth-guard';
import { roleGuard } from '@core/guards/role-guard';
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
        path: 'login',
        title: 'Login',
        loadComponent: () => import('@features/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'users',
        title: 'Users',
        // Guard: only logged-in users can open this page.
        canActivate: [authGuard],
        loadComponent: () => import('@features/users/user-list/user-list').then((m) => m.UserList),
      },
      {
        path: 'posts',
        title: 'Posts',
        canActivate: [authGuard],
        loadComponent: () => import('@features/posts/post-list/post-list').then((m) => m.PostList),
      },
      {
        path: 'admin',
        title: 'Admin',
        // Two guards, run in order: logged in? (authGuard) then has the role? (roleGuard)
        canActivate: [authGuard, roleGuard],
        // roleGuard reads the allowed roles from here.
        data: { roles: ['admin'] },
        loadComponent: () =>
          import('@features/admin/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'forbidden',
        title: 'Access denied',
        loadComponent: () => import('@features/forbidden/forbidden').then((m) => m.Forbidden),
      },
      {
        path: '**',
        title: 'Page not found',
        loadComponent: () => import('@features/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
