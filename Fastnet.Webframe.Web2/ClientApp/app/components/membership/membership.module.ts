import { NgModule  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MembershipComponent } from './membership.component';
//import { PageComponent } from '../page/page.component';
import { PageModule } from '../page/page.module';
import { routing } from './membership.routing';
import { ControlsModule } from "../controls/controls.module";
import { ModalDialogModule } from '../modaldialog/modal-dialog.module';


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
        MembershipComponent
        ],
    providers: [],
})
export class MembershipModule { }