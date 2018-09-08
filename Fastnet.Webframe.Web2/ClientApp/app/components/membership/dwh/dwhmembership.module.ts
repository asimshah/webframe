import { NgModule } from '@angular/core';
import { DwhMembershipComponent } from './dwhmembership.component';
import { PageModule } from '../../page/page.module';
import { routing } from './dwhmembership.routing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MembershipSharedModule } from '../membership.shared.module';
import { ControlsModule } from '../../../fastnet/controls/controls.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        routing,
        PageModule,
        ControlsModule,
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