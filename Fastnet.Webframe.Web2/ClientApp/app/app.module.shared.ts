import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './components/app/app.component';
import { AppRoutingModule } from './app-routing.module';

import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/home/pagenotfound.component';
import { EditorComponent } from './components/home/editor/editor.component';
//import { PageComponent } from './components/page/page.component';
import { PageModule } from './components/page/page.module';
import { MenuComponent } from './components/home/menu.component';
import { SidebarMenuComponent } from './components/home/sidebarmenu.component';
import { LoginComponent } from './components/authentication/login.component';
//import { ModalDialogComponent } from './components/modaldialog/modal-dialog.component';
import { PermissionDeniedComponent } from './components/routeguards/permissiondenied.component';
import { ControlsModule } from "./components/controls/controls.module";
import { ModalDialogModule } from './components/modaldialog/modal-dialog.module';
//import { MembershipComponent } from './components/membership/membership.component';
//import { DwhMembershipComponent } from './components/membership/dwh/dwhmembership.component';
import { MembershipPlaceholderComponent } from './components/membership/membership-placeholder.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        PageNotFoundComponent,
        //PageComponent,
        MenuComponent,
        SidebarMenuComponent,
        EditorComponent,
        LoginComponent,
        PermissionDeniedComponent,
        MembershipPlaceholderComponent
        //,
        //MembershipComponent,
        //DwhMembershipComponent
    ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        PageModule,
        AppRoutingModule,
        ControlsModule,
        ModalDialogModule
    ],
    providers: [
        
    ]
    //,
    //entryComponents: [MembershipComponent, DwhMembershipComponent]
})


export class AppModuleShared {
}
