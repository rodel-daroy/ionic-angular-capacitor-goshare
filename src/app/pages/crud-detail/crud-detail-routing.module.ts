import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrudDetailPage } from './crud-detail.page';

const routes: Routes = [
  {
    path: '',
    component: CrudDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrudDetailPageRoutingModule {}
