import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TreeViewComponent } from './tree-view.component';
import { TextInputControl } from './text-input.component';
import { MultilineTextInput } from './multiline-input.component';
import { SearchInputControl } from './search-input.component';
import { PasswordInputControl } from './password-input.component';
import { EmailInputControl } from './email-input.component';
import { NumberInputControl } from './number-input.component';
import { DateInputControl } from './date-input.component';
import { BoolInputControl } from './bool-input.component';
import { EnumInputControl } from './enum-input.component';
import { BoolEnumInputControl } from './bool-enum-input.component';
import { DropDownControl } from './dropdown-input.component';
import { InlineDialogComponent } from './inline-dialog.component';
import { ComboBoxComponent } from './combo-box.component';
import { PopupDialogComponent } from './popup-dialog.component';



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
        DropDownControl,
        TreeViewComponent,
        InlineDialogComponent,
        ComboBoxComponent,
        PopupDialogComponent
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
        DropDownControl,
        TreeViewComponent,
        InlineDialogComponent,
        ComboBoxComponent,
        PopupDialogComponent

    ],
    providers: [],
})
export class ControlsModule { }
