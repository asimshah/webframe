import { NgModule } from '@angular/core';

import { TinyMCEComponent } from './tinymce.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    exports: [TinyMCEComponent],
    declarations: [TinyMCEComponent],
    providers: [],
})
export class TinyMCEModule { }
