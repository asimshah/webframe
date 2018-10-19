import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConfigService } from './components/shared/config.service';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/home/pagenotfound.component';
import { PageService } from './components/shared/page.service';
import { LoginComponent } from './components/authentication/login.component';

import { AdminGuard } from './components/routeguards/admin-guard.service';
import { MemberGuard } from './components/routeguards/member-guard.service';
import { PermissionDeniedComponent } from './components/routeguards/permissiondenied.component';
//import { ModalDialogService } from './components/modaldialog/modal-dialog.service';
import { AuthenticationService } from './components/authentication/authentication.service';
import { MembershipService } from './components/membership/membership.service';
import { DWHMembershipService } from './components/membership/dwh/dwhmembership.service';
//import { MembershipPlaceholderComponent } from './components/membership/membership-placeholder.component';
//import { RegisterComponent } from './components/authentication/register.component';
import { ResetPasswordComponent } from './components/authentication/resetpassword.component';
import { ActivateComponent } from './components/authentication/activate.component';
//import { ContentService } from './components/shared/content.service';
import { EditorGuard } from './components/routeguards/editor-guard.service';
import { LogoutComponent } from './components/authentication/logout.component';
import { TestComponent } from './components/test/test.component';
import { MCETestComponent } from './components/test/mcetest.component';


const appRoutes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'logout', component: LogoutComponent},
    { path: 'page/:id', component: HomeComponent },
    { path: 'login', component: LoginComponent },

    { path: 'passwordreset/:id/:code', component: ResetPasswordComponent },
    //{ path: 'membership', component: MembershipPlaceholderComponent},
    { path: 'register', loadChildren: './components/authentication/register.module#RegisterModule' },
    { path: 'activate/:id/:code', component: ActivateComponent },
    { path: 'test', component: TestComponent},
    { path: 'membership', loadChildren: './components/membership/membership.module#MembershipModule', canLoad: [AdminGuard], canActivate: [AdminGuard] },
    { path: 'booking', loadChildren: './components/booking/booking.module#BookingModule', canLoad: [MemberGuard], canActivate: [MemberGuard] },
    { path: 'cms', loadChildren: './components/cms/cms.module#CmsModule', canLoad: [AdminGuard] },
    { path: 'designer', loadChildren: './components/designer/designer.module#DesignerModule', canLoad: [AdminGuard] },
    { path: 'edit/:id', loadChildren: './components/home/editor/webframe-editor.module#WebframeEditorModule', canLoad:[EditorGuard], canActivate:[EditorGuard] },
    { path: 'permissiondenied/:msg/:allowLogin', component: PermissionDeniedComponent },
    { path: 'pagenotfound', component: PageNotFoundComponent },
    { path: '**', redirectTo: 'home' },
    // add additional custom routes here with a guard that disable thems
    // then in the constructor below first fetch the cutomisation rules
    // and replace loadchildren of the target route with theload of the custom route
    // e.g. replace loadchildren of 'membership' with loadchildren of dwhmembership
    { path: 'dwhmembership', loadChildren: './components/membership/dwh/dwhmembership.module#DwhMembershipModule', canLoad: [AdminGuard] },
    { path: 'dwhregister', loadChildren: './components/authentication/dwh/dwhregister.module#DwhRegisterModule' },
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
        EditorGuard,
        MemberGuard,
        ConfigService,
        AuthenticationService,
        PageService,
        //ContentService,
        MembershipService,
        DWHMembershipService
    ]
})
export class AppRoutingModule {

}
