import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DwhMembershipComponent } from './dwhmembership.component';

const routes: Routes = [
    { path: '', component: DwhMembershipComponent }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);