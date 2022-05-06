import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerificationDetailPage } from './verification-detail.page';

const routes: Routes = [
  {
    path: '',
    component: VerificationDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerificationDetailPageRoutingModule {}
