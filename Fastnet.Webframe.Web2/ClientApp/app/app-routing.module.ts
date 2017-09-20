import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { AdminGuard } from './components/routeguards/admin-guard.service';
import { MemberGuard } from './components/routeguards/member-guard.service';
import { PermissionDeniedComponent } from './components/routeguards/permissiondenied.component';

const appRoutes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'membership', loadChildren: './components/membership/membership.module#MembershipModule', canLoad: [AdminGuard] },
    { path: 'booking', loadChildren: './components/booking/booking.module#BookingModule', canLoad: [MemberGuard] },
    { path: 'cms', loadChildren: './components/cms/cms.module#CmsModule', canLoad: [AdminGuard] },
    { path: 'designer', loadChildren: './components/designer/designer.module#DesignerModule', canLoad: [AdminGuard] },
    { path: 'permissiondenied/:msg/:allowLogin', component: PermissionDeniedComponent},
    { path: '**', redirectTo: 'home' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            { enableTracing: true}
        )
    ],
    exports: [
        RouterModule
    ],
    providers: [AdminGuard, MemberGuard],
})
export class AppRoutingModule { }
