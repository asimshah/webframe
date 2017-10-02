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
import { PageComponent } from './components/page/page.component';
import { MenuComponent } from './components/home/menu.component';
import { LoginComponent } from './components/authentication/login.component';
import { ModalDialogComponent } from './components/modaldialog/modal-dialog.component';
import { PermissionDeniedComponent } from './components/routeguards/permissiondenied.component';



@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        PageNotFoundComponent,
        PageComponent,
        MenuComponent,
        EditorComponent,
        LoginComponent,
        PermissionDeniedComponent,
        ModalDialogComponent
    ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        AppRoutingModule
    ],
    providers: [
        
    ]
})


export class AppModuleShared {
}
