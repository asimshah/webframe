import { NgModule } from '@angular/core';

import { DwhMembershipComponent } from './dwhmembership.component';
//import { MembershipComponent } from '../membership.component';
import { PageModule } from '../../page/page.module';

import { routing } from './dwhmembership.routing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlsModule } from '../../controls/controls.module';
import { ModalDialogModule } from '../../modaldialog/modal-dialog.module';

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
    //declarations: [MembershipComponent, DwhMembershipComponent],
    declarations: [
        DwhMembershipComponent
    ],
    providers: [],
})
export class DwhMembershipModule { }