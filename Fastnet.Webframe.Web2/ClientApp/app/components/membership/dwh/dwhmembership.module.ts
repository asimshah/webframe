import { NgModule } from '@angular/core';

import { DwhMembershipComponent } from './dwhmembership.component';
//import { MembershipComponent } from '../membership.component';
import { PageModule } from '../../page/page.module';

import { routing } from './dwhmembership.routing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlsModule } from '../../controls/controls.module';
import { ModalDialogModule } from '../../modaldialog/modal-dialog.module';
//import { GroupTreeComponent } from '../group-tree.component';
//import { TreeModule } from 'angular-tree-component';
import { MembershipSharedModule } from '../membership.shared.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        routing,
        PageModule,
        ControlsModule,
        ModalDialogModule,
        //TreeModule,
        MembershipSharedModule
    ],
    exports: [],
    //declarations: [MembershipComponent, DwhMembershipComponent],
    declarations: [
        DwhMembershipComponent,
        //GroupTreeComponent
    ],
    providers: [],
})
export class DwhMembershipModule { }