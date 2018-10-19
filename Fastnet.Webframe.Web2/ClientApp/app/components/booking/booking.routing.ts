import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookingComponent } from './booking.component';
import { BookingAdminComponent } from './admin/booking-admin.component';
import { AdminGuard } from '../routeguards/admin-guard.service';

const routes: Routes = [
    { path: '', component: BookingComponent },
    { path: 'admin', component: BookingAdminComponent, canLoad: [AdminGuard], canActivate: [AdminGuard]}
];

export const bookingRouting: ModuleWithProviders = RouterModule.forChild(routes);