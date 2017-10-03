﻿import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/home/pagenotfound.component';
import { PageService } from './components/shared/page.service';
import { LoginComponent } from './components/authentication/login.component';

import { AdminGuard } from './components/routeguards/admin-guard.service';
import { MemberGuard } from './components/routeguards/member-guard.service';
import { PermissionDeniedComponent } from './components/routeguards/permissiondenied.component';
import { ModalDialogService } from './components/modaldialog/modal-dialog.service';
import { AuthenticationService } from './components/authentication/authentication.service';


const appRoutes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'logout', component: HomeComponent },
    { path: 'page/:id', component: HomeComponent},
    { path: 'login', component: LoginComponent },
    //{ path: 'webframe', loadChildren: './components/home/home.module#HomeModule' },
    { path: 'membership', loadChildren: './components/membership/membership.module#MembershipModule', canLoad: [AdminGuard] },
    { path: 'booking', loadChildren: './components/booking/booking.module#BookingModule', canLoad: [MemberGuard] },
    { path: 'cms', loadChildren: './components/cms/cms.module#CmsModule', canLoad: [AdminGuard] },
    { path: 'designer', loadChildren: './components/designer/designer.module#DesignerModule', canLoad: [AdminGuard] },
    { path: 'permissiondenied/:msg/:allowLogin', component: PermissionDeniedComponent },
    { path: 'pagenotfound', component: PageNotFoundComponent },
    { path: '**', redirectTo: 'home' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            { enableTracing: false}
        )
    ],
    exports: [
        RouterModule
    ],
    providers: [AdminGuard, MemberGuard, AuthenticationService, ModalDialogService, PageService],
})
export class AppRoutingModule { }
