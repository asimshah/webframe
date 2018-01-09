import { NgModule  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MembershipComponent } from './membership.component';
//import { PageComponent } from '../page/page.component';
import { PageModule } from '../page/page.module';
import { routing } from './membership.routing';
import {
    TextInputControl,
    PasswordInputControl,
    EmailInputControl,
    NumberInputControl,
    DateInputControl,
    BoolInputControl,
    EnumInputControl,
    DropDownControl
} from "../controls/controls.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        routing,
        PageModule
    ],
    exports: [],
    declarations: [
        //PageComponent,
        MembershipComponent,
        TextInputControl,
        PasswordInputControl,
        EmailInputControl,
        NumberInputControl,
        DateInputControl,
        BoolInputControl,
        EnumInputControl,
        DropDownControl
        ],
    providers: [],
})
export class MembershipModule { }