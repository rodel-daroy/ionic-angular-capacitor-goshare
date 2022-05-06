import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IncomingSharesPage } from './incoming-shares.page';

const routes: Routes = [
  {
    path: '',
    component: IncomingSharesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IncomingSharesPageRoutingModule {}
