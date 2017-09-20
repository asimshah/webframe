import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CmsComponent } from './cms.component';

const routes: Routes = [
    { path: '', component: CmsComponent }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);