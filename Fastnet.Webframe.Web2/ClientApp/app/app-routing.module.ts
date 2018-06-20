import { NgModule, OnInit } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';

import { ConfigService } from './components/shared/config.service';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/home/pagenotfound.component';
import { PageService } from './components/shared/page.service';
import { LoginComponent } from './components/authentication/login.component';

import { AdminGuard } from './components/routeguards/admin-guard.service';
import { MemberGuard } from './components/routeguards/member-guard.service';
import { PermissionDeniedComponent } from './components/routeguards/permissiondenied.component';
import { ModalDialogService } from './components/modaldialog/modal-dialog.service';
import { AuthenticationService } from './components/authentication/authentication.service';
import { MembershipService } from './components/membership/membership.service';
import { DWHMembershipService } from './components/membership/dwh/dwhmembership.service';


const appRoutes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'logout', component: HomeComponent },
    { path: 'page/:id', component: HomeComponent},
    { path: 'login', component: LoginComponent },
    { path: 'membership', loadChildren: './components/membership/membership.module#MembershipModule', canLoad: [AdminGuard] },
    { path: 'booking', loadChildren: './components/booking/booking.module#BookingModule', canLoad: [MemberGuard] },
    { path: 'cms', loadChildren: './components/cms/cms.module#CmsModule', canLoad: [AdminGuard] },
    { path: 'designer', loadChildren: './components/designer/designer.module#DesignerModule', canLoad: [AdminGuard] },
    { path: 'permissiondenied/:msg/:allowLogin', component: PermissionDeniedComponent },
    { path: 'pagenotfound', component: PageNotFoundComponent },
    { path: '**', redirectTo: 'home' },
    // add additional custom routes here with a guard that disable thems
    // then in the constructor below first fetch the cutomisation rules
    // and replace loadchildren of the target route with theload of the custom route
    // e.g. replace loadchildren of 'membership' with loadchildren of dwhmembership
    { path: 'dwhmembership', loadChildren: './components/membership/dwh/dwhmembership.module#DwhMembershipModule', canLoad: [AdminGuard] },
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            { enableTracing: false }
        )
    ],
    exports: [
        RouterModule
    ],
    providers: [
        AdminGuard,
        MemberGuard,
        ConfigService,
        AuthenticationService,
        //ModalDialogService,
        PageService,
        MembershipService,
        DWHMembershipService
    ],
})
export class AppRoutingModule  {

}
