import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookingComponent } from './booking.component';

const routes: Routes = [
    { path: '', component: BookingComponent }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);