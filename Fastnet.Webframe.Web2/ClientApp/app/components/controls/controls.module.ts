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
import { DateInput2Control } from './date-input.component';
import { TreeViewComponent } from './tree-view.component';

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
        DateInput2Control,
        BoolInputControl,
        EnumInputControl,
        BoolEnumInputControl,
        DropDownControl,
        TreeViewComponent
    ],
    declarations: [
        TextInputControl,
        MultilineTextInput,
        SearchInputControl,
        PasswordInputControl,
        EmailInputControl,
        NumberInputControl,
        DateInputControl,
        DateInput2Control,
        BoolInputControl,
        EnumInputControl,
        BoolEnumInputControl,
        DropDownControl,
        TreeViewComponent
    ],
    providers: [],
})
export class ControlsModule { }
