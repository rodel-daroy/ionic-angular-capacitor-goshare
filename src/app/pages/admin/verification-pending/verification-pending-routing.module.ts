import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerificationPendingPage } from './verification-pending.page';

const routes: Routes = [
  {
    path: '',
    component: VerificationPendingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerificationPendingPageRoutingModule {}
