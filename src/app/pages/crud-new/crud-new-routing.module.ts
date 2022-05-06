import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrudNewPage } from './crud-new.page';

const routes: Routes = [
  {
    path: '',
    component: CrudNewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrudNewPageRoutingModule {}
