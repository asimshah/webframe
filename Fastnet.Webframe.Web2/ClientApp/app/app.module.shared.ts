import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './components/app/app.component';
import { AppRoutingModule } from './app-routing.module';

import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/home/pagenotfound.component';
import { PageModule } from './components/page/page.module';
import { LoginComponent } from './components/authentication/login.component';
import { PermissionDeniedComponent } from './components/routeguards/permissiondenied.component';
import { MembershipPlaceholderComponent } from './components/membership/membership-placeholder.component';
import { ResetPasswordComponent } from './components/authentication/resetpassword.component';
import { ActivateComponent } from './components/authentication/activate.component';
import { LogoutComponent } from './components/authentication/logout.component';
import { TestComponent } from './components/test/test.component';
import { ControlsModule } from './fastnet/controls/controls.module';
import { MCETestComponent } from './components/test/mcetest.component';
import { TinyMCEModule } from './fastnet/tinymce/tinymce.module';
//import { CustomCssComponent } from './components/home/custom-css.component';

@NgModule({
    declarations: [
        AppComponent,
        //CustomCssComponent,
        HomeComponent,
        PageNotFoundComponent,
        LoginComponent,
        LogoutComponent,
        ResetPasswordComponent,
        ActivateComponent,
        PermissionDeniedComponent,
        MembershipPlaceholderComponent,
        TestComponent,
        MCETestComponent
    ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        PageModule,
        AppRoutingModule,
        ControlsModule,
        TinyMCEModule
    ],
    providers: [
        
    ]
    //,
    //entryComponents: [MembershipComponent, DwhMembershipComponent]
})


export class AppModuleShared {
}
