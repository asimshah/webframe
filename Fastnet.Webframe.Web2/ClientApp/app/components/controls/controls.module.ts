import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
    TextInputControl,
    MultilineTextInput,
    SearchInputControl,
    PasswordInputControl,
    EmailInputControl,
    NumberInputControl,
    DateInputControl,
    BoolInputControl,
    EnumInputControl,
    BoolEnumInputControl,
    DropDownControl
} from "./controls.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    exports: [
        TextInputControl,
        MultilineTextInput,
        SearchInputControl,
        PasswordInputControl,
        EmailInputControl,
        NumberInputControl,
        DateInputControl,
        BoolInputControl,
        EnumInputControl,
        BoolEnumInputControl,
        DropDownControl
    ],
    declarations: [
        TextInputControl,
        MultilineTextInput,
        SearchInputControl,
        PasswordInputControl,
        EmailInputControl,
        NumberInputControl,
        DateInputControl,
        BoolInputControl,
        EnumInputControl,
        BoolEnumInputControl,
        DropDownControl
    ],
    providers: [],
})
export class ControlsModule { }
