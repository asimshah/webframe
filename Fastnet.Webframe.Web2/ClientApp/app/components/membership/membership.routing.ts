import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MembershipComponent } from './membership.component';

const routes: Routes = [
    { path: '', component: MembershipComponent }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);