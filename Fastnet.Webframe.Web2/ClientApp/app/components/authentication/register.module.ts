import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PageModule } from '../page/page.module';
import { routing } from './register.routing';
import { ControlsModule } from "../controls/controls.module";
import { ModalDialogModule } from '../modaldialog/modal-dialog.module';
import { RegisterComponent } from './register.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        routing,
        PageModule,
        ControlsModule,
        ModalDialogModule
    ],
    exports: [],
    declarations: [
        RegisterComponent
    ],
    providers: [],
})
export class RegisterModule { }