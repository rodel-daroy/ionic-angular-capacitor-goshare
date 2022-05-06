import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: 'splash',
    loadChildren: () => import('./pages/splash/splash.module').then( m => m.SplashPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('./pages/welcome/welcome.module').then( m => m.WelcomePageModule)
  },
  {
    path: 'preview',
    loadChildren: () => import('./pages/preview/preview.module').then( m => m.PreviewPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'profile/:id',
    loadChildren: () => import('./pages/profile-public/profile-public.module').then( m => m.ProfilePublicPageModule)
  },
  {
    path: 'crud-items',
    loadChildren: () => import('./pages/crud-items/crud-items.module').then( m => m.CrudItemsPageModule)
  },
  {
    path: 'crud-new',
    loadChildren: () => import('./pages/crud-new/crud-new.module').then( m => m.CrudNewPageModule)
  },
  {
    path: 'crud-detail',
    loadChildren: () => import('./pages/crud-detail/crud-detail.module').then(m => m.CrudDetailPageModule)
  },
  {
    path: 'verification',
    loadChildren: () => import('./pages/verification/verification.module').then( m => m.VerificationPageModule)
  },
  {
    path: 'connections',
    loadChildren: () => import('./pages/connections/connections.module').then( m => m.ConnectionsPageModule)
  },
  {
    path: 'incoming-shares',
    loadChildren: () => import('./pages/admin/incoming-shares/incoming-shares.module').then( m => m.IncomingSharesPageModule)
  },
  {
    path: 'user-list',
    loadChildren: () => import('./pages/admin/user-list/user-list.module').then( m => m.UserListPageModule)
  },
  {
    path: 'verification-pending',
    loadChildren: () => import('./pages/admin/verification-pending/verification-pending.module').then( m => m.VerificationPendingPageModule)
  },
  {
    path: 'verification-detail',
    loadChildren: () => import('./pages/admin/verification-detail/verification-detail.module').then( m => m.VerificationDetailPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
