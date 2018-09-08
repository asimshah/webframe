import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PageModule } from '../page/page.module';
import { routing } from './register.routing';

import { RegisterComponent } from './register.component';
import { ControlsModule } from '../../fastnet/controls/controls.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        routing,
        PageModule,
        ControlsModule
    ],
    exports: [],
    declarations: [
        RegisterComponent
    ],
    providers: [],
})
export class RegisterModule { }