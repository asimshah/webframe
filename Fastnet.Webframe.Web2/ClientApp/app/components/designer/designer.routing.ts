import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DesignerComponent } from './designer.component';

const routes: Routes = [
    { path: '', component: DesignerComponent }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);